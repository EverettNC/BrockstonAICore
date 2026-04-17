import aiohttp
import asyncio
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser
from typing import Optional, Dict, Any
import time


class WebCrawler:
    def __init__(self, config: Dict[str, Any], logger):
        self.config = config
        self.logger = logger
        self.rate_limit = config["ideal"]["learning"].get("rate_limit_seconds", 2)
        self.respect_robots = config["ideal"]["learning"].get(
            "respect_robots_txt", True
        )
        self.last_request_time = {}
        self.robots_parsers = {}

    async def _check_robots_txt(self, url: str) -> bool:
        """Check if URL is allowed by robots.txt"""
        if not self.respect_robots:
            return True

        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"

        if base_url not in self.robots_parsers:
            robot_parser = RobotFileParser()
            robot_url = urljoin(base_url, "/robots.txt")
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        robot_url, timeout=aiohttp.ClientTimeout(total=5)
                    ) as response:
                        if response.status == 200:
                            content = await response.text()
                            robot_parser.parse(content.splitlines())
            except:
                pass
            self.robots_parsers[base_url] = robot_parser

        return self.robots_parsers[base_url].can_fetch("*", url)

    async def _apply_rate_limit(self, domain: str):
        """Apply rate limiting per domain"""
        if domain in self.last_request_time:
            elapsed = time.time() - self.last_request_time[domain]
            if elapsed < self.rate_limit:
                await asyncio.sleep(self.rate_limit - elapsed)
        self.last_request_time[domain] = time.time()

    def _is_allowed_source(self, url: str) -> bool:
        """Check if URL is from an approved educational source"""
        allowed_sources = self.config["ideal"]["learning"]["crawl_sources"]
        parsed = urlparse(url)
        url_domain = f"{parsed.scheme}://{parsed.netloc}".lower().rstrip("/")

        for source in allowed_sources:
            source_parsed = urlparse(source)
            source_domain = (
                f"{source_parsed.scheme}://{source_parsed.netloc}".lower().rstrip("/")
            )
            if url_domain == source_domain:
                return True
        return False

    async def fetch_url(self, url: str) -> str:
        """Fetch content from URL with robots.txt compliance and rate limiting"""
        if not self._is_allowed_source(url):
            raise Exception(
                "Access denied: URL must be from approved educational sources"
            )

        if not await self._check_robots_txt(url):
            raise Exception(f"Access denied by robots.txt: {url}")

        parsed = urlparse(url)
        domain = parsed.netloc
        await self._apply_rate_limit(domain)

        self.logger.log_external_request(url, "educational_resource_retrieval")

        async with aiohttp.ClientSession() as session:
            async with session.get(
                url, timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, "html.parser")

                    for script in soup(["script", "style"]):
                        script.decompose()

                    text = soup.get_text()
                    lines = (line.strip() for line in text.splitlines())
                    chunks = (
                        phrase.strip() for line in lines for phrase in line.split("  ")
                    )
                    text = "\n".join(chunk for chunk in chunks if chunk)

                    self.logger.log_external_request(
                        url, "educational_resource_retrieval", len(text)
                    )
                    return text
                else:
                    raise Exception(f"HTTP {response.status}: {url}")

    async def search_topic(self, source_url: str, topic: str) -> Optional[str]:
        """Search for topic in educational source"""
        try:
            content = await self.fetch_url(source_url)
            if topic.lower() in content.lower():
                return content[:10000]
            return None
        except Exception as e:
            self.logger.log_event(
                "crawl_error", {"source": source_url, "topic": topic, "error": str(e)}
            )
            return None

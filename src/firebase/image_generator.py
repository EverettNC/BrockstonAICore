"""
BROKSTON Image Generation & Manipulation Module
===============================================
Real-time image generation, editing, and visual effects
while BROKSTON speaks and interacts.

Capabilities:
- Generate images from text descriptions
- Edit/manipulate existing images
- Apply filters and effects
- Create animations and transitions
- Real-time visual feedback during conversation
"""

import logging
import base64
from io import BytesIO
from typing import Dict, Any, Optional, Tuple, List
from pathlib import Path

# PIL/Pillow for image manipulation
try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# OpenCV for advanced processing
try:
    import cv2
    import numpy as np

    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ImageGenerator:
    """
    Generate and manipulate images in real-time
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.default_size = (1024, 1024)
        self.cache_dir = Path("generated_images")
        self.cache_dir.mkdir(exist_ok=True)

        if not PIL_AVAILABLE:
            logger.warning("PIL not available - install with: pip install Pillow")
        if not CV2_AVAILABLE:
            logger.warning(
                "OpenCV not available - install with: pip install opencv-python"
            )

        logger.info(
            f"ImageGenerator initialized (PIL: {PIL_AVAILABLE}, CV2: {CV2_AVAILABLE})"
        )

    def generate_from_text(
        self, description: str, style: str = "modern"
    ) -> Optional[bytes]:
        """
        Generate an image from text description

        Args:
            description: What to generate
            style: Visual style (modern, retro, minimalist, vibrant)

        Returns:
            Image bytes (PNG format)
        """
        if not PIL_AVAILABLE:
            logger.error("PIL required for image generation")
            return None

        try:
            # For now, create a styled placeholder with the description
            # You can integrate with DALL-E, Stable Diffusion, or Midjourney API later
            img = self._create_styled_image(description, style)
            return self._image_to_bytes(img)
        except Exception as e:
            logger.error(f"Error generating image: {e}")
            return None

    def _create_styled_image(self, text: str, style: str):
        """Create a styled image with text"""
        # Create base image
        img = Image.new("RGB", self.default_size, color=self._get_style_color(style))
        draw = ImageDraw.Draw(img)

        # Try to load font, fallback to default
        try:
            font = ImageFont.truetype("arial.ttf", 40)
            title_font = ImageFont.truetype("arial.ttf", 60)
        except:
            font = ImageFont.load_default()
            title_font = font

        # Draw title
        title = "BROKSTON GENERATED"
        title_bbox = draw.textbbox((0, 0), title, font=title_font)
        title_w = title_bbox[2] - title_bbox[0]
        draw.text(
            ((self.default_size[0] - title_w) // 2, 100),
            title,
            fill=(255, 255, 255),
            font=title_font,
        )

        # Draw description (word wrap)
        words = text.split()
        lines = []
        current_line = []

        for word in words:
            current_line.append(word)
            line = " ".join(current_line)
            bbox = draw.textbbox((0, 0), line, font=font)
            if bbox[2] - bbox[0] > self.default_size[0] - 200:
                if len(current_line) > 1:
                    current_line.pop()
                    lines.append(" ".join(current_line))
                    current_line = [word]
                else:
                    lines.append(line)
                    current_line = []

        if current_line:
            lines.append(" ".join(current_line))

        # Draw text lines
        y = 300
        for line in lines[:10]:  # Max 10 lines
            bbox = draw.textbbox((0, 0), line, font=font)
            line_w = bbox[2] - bbox[0]
            draw.text(
                ((self.default_size[0] - line_w) // 2, y),
                line,
                fill=(255, 255, 255),
                font=font,
            )
            y += 60

        # Add decorative elements based on style
        if style == "modern":
            draw.rectangle([50, 50, 150, 70], fill=(255, 255, 255, 128))
        elif style == "vibrant":
            for i in range(5):
                draw.ellipse(
                    [
                        np.random.randint(0, self.default_size[0]),
                        np.random.randint(0, self.default_size[1]),
                        np.random.randint(0, self.default_size[0]),
                        np.random.randint(0, self.default_size[1]),
                    ],
                    fill=tuple(np.random.randint(100, 255, 3).tolist()),
                )

        return img

    def _get_style_color(self, style: str) -> Tuple[int, int, int]:
        """Get background color for style"""
        colors = {
            "modern": (30, 30, 50),
            "retro": (255, 200, 100),
            "minimalist": (240, 240, 245),
            "vibrant": (20, 150, 200),
            "dark": (15, 15, 15),
            "light": (250, 250, 250),
        }
        return colors.get(style, (30, 30, 50))

    def manipulate_image(
        self, image_data: bytes, operations: List[Dict[str, Any]]
    ) -> Optional[bytes]:
        """
        Apply manipulations to an image

        Args:
            image_data: Input image bytes
            operations: List of operations to apply
                       [{'type': 'blur', 'amount': 5},
                        {'type': 'brightness', 'factor': 1.2}]

        Returns:
            Modified image bytes
        """
        if not PIL_AVAILABLE:
            return None

        try:
            img = Image.open(BytesIO(image_data))

            for op in operations:
                op_type = op.get("type", "").lower()

                if op_type == "blur":
                    img = img.filter(ImageFilter.GaussianBlur(op.get("amount", 2)))

                elif op_type == "sharpen":
                    img = img.filter(ImageFilter.SHARPEN)

                elif op_type == "brightness":
                    enhancer = ImageEnhance.Brightness(img)
                    img = enhancer.enhance(op.get("factor", 1.0))

                elif op_type == "contrast":
                    enhancer = ImageEnhance.Contrast(img)
                    img = enhancer.enhance(op.get("factor", 1.0))

                elif op_type == "saturation":
                    enhancer = ImageEnhance.Color(img)
                    img = enhancer.enhance(op.get("factor", 1.0))

                elif op_type == "resize":
                    size = op.get("size", (512, 512))
                    img = img.resize(size, Image.Resampling.LANCZOS)

                elif op_type == "rotate":
                    img = img.rotate(op.get("angle", 0), expand=True)

                elif op_type == "flip":
                    direction = op.get("direction", "horizontal")
                    if direction == "horizontal":
                        img = img.transpose(Image.FLIP_LEFT_RIGHT)
                    else:
                        img = img.transpose(Image.FLIP_TOP_BOTTOM)

                elif op_type == "grayscale":
                    img = img.convert("L").convert("RGB")

                elif op_type == "sepia":
                    img = self._apply_sepia(img)

                elif op_type == "add_text":
                    img = self._add_text_overlay(
                        img,
                        op.get("text", ""),
                        op.get("position", "center"),
                        op.get("color", (255, 255, 255)),
                    )

            return self._image_to_bytes(img)

        except Exception as e:
            logger.error(f"Error manipulating image: {e}")
            return None

    def _apply_sepia(self, img):
        """Apply sepia tone effect"""
        # Convert to numpy array
        img_array = np.array(img)

        # Sepia matrix
        sepia_matrix = np.array(
            [[0.393, 0.769, 0.189], [0.349, 0.686, 0.168], [0.272, 0.534, 0.131]]
        )

        # Apply sepia
        sepia_img = img_array @ sepia_matrix.T
        sepia_img = np.clip(sepia_img, 0, 255).astype(np.uint8)

        return Image.fromarray(sepia_img)

    def _add_text_overlay(
        self,
        img,
        text: str,
        position: str = "center",
        color: Tuple[int, int, int] = (255, 255, 255),
    ):
        """Add text overlay to image"""
        draw = ImageDraw.Draw(img)

        try:
            font = ImageFont.truetype("arial.ttf", 40)
        except:
            font = ImageFont.load_default()

        # Calculate position
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        if position == "center":
            x = (img.width - text_w) // 2
            y = (img.height - text_h) // 2
        elif position == "top":
            x = (img.width - text_w) // 2
            y = 50
        elif position == "bottom":
            x = (img.width - text_w) // 2
            y = img.height - text_h - 50
        else:
            x, y = 50, 50

        # Draw text with shadow for better visibility
        draw.text((x + 2, y + 2), text, fill=(0, 0, 0), font=font)
        draw.text((x, y), text, fill=color, font=font)

        return img

    def create_animation_frame(
        self, text: str, frame_number: int, total_frames: int, style: str = "wave"
    ) -> Optional[bytes]:
        """
        Create an animation frame

        Args:
            text: Text to animate
            frame_number: Current frame (0-based)
            total_frames: Total frames in animation
            style: Animation style (wave, pulse, rotate)
        """
        if not PIL_AVAILABLE:
            return None

        try:
            img = Image.new("RGB", (800, 600), color=(20, 20, 40))
            draw = ImageDraw.Draw(img)

            # Animation progress (0.0 to 1.0)
            progress = frame_number / total_frames

            if style == "wave":
                # Wave effect
                y_offset = int(50 * np.sin(progress * 2 * np.pi))
                y = 300 + y_offset
            elif style == "pulse":
                # Pulsing size
                scale = 0.8 + 0.4 * abs(np.sin(progress * 2 * np.pi))
                y = 300
            elif style == "rotate":
                # Rotating text (we'll just move it in a circle)
                angle = progress * 2 * np.pi
                radius = 100
                x_offset = int(radius * np.cos(angle))
                y_offset = int(radius * np.sin(angle))
                y = 300 + y_offset
            else:
                y = 300

            # Draw text
            try:
                font = ImageFont.truetype("arial.ttf", 50)
            except:
                font = ImageFont.load_default()

            bbox = draw.textbbox((0, 0), text, font=font)
            text_w = bbox[2] - bbox[0]
            draw.text(((800 - text_w) // 2, y), text, fill=(255, 255, 255), font=font)

            return self._image_to_bytes(img)

        except Exception as e:
            logger.error(f"Error creating animation frame: {e}")
            return None

    def apply_opencv_effect(
        self, image_data: bytes, effect: str, **params
    ) -> Optional[bytes]:
        """
        Apply OpenCV effects to image

        Args:
            image_data: Input image
            effect: Effect name (edge_detect, cartoon, sketch, etc.)
            params: Effect parameters
        """
        if not CV2_AVAILABLE:
            logger.warning("OpenCV not available")
            return None

        try:
            # Decode image
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if effect == "edge_detect":
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                edges = cv2.Canny(gray, params.get("low", 50), params.get("high", 150))
                img = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

            elif effect == "cartoon":
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                gray = cv2.medianBlur(gray, 5)
                edges = cv2.adaptiveThreshold(
                    gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9
                )
                color = cv2.bilateralFilter(img, 9, 300, 300)
                img = cv2.bitwise_and(color, color, mask=edges)

            elif effect == "sketch":
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                inv_gray = 255 - gray
                blur = cv2.GaussianBlur(inv_gray, (21, 21), 0)
                sketch = cv2.divide(gray, 255 - blur, scale=256)
                img = cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)

            elif effect == "blur":
                ksize = params.get("kernel_size", 15)
                img = cv2.GaussianBlur(img, (ksize, ksize), 0)

            elif effect == "sharpen":
                kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
                img = cv2.filter2D(img, -1, kernel)

            # Encode back to bytes
            _, buffer = cv2.imencode(".png", img)
            return buffer.tobytes()

        except Exception as e:
            logger.error(f"Error applying OpenCV effect: {e}")
            return None

    def _image_to_bytes(self, img, format: str = "PNG") -> bytes:
        """Convert PIL Image to bytes"""
        buffer = BytesIO()
        img.save(buffer, format=format)
        return buffer.getvalue()

    def bytes_to_base64(self, image_bytes: bytes) -> str:
        """Convert image bytes to base64 string"""
        return base64.b64encode(image_bytes).decode("utf-8")

    def base64_to_bytes(self, base64_str: str) -> bytes:
        """Convert base64 string to image bytes"""
        return base64.b64decode(base64_str)

    def get_capabilities(self) -> Dict[str, bool]:
        """Get available capabilities"""
        return {
            "basic_generation": PIL_AVAILABLE,
            "image_manipulation": PIL_AVAILABLE,
            "filters": PIL_AVAILABLE,
            "text_overlay": PIL_AVAILABLE,
            "animation": PIL_AVAILABLE,
            "opencv_effects": CV2_AVAILABLE,
            "advanced_processing": CV2_AVAILABLE,
        }


# Singleton instance
_generator_instance = None


def get_image_generator(config: Optional[Dict[str, Any]] = None) -> ImageGenerator:
    """Get or create image generator singleton"""
    global _generator_instance
    if _generator_instance is None:
        _generator_instance = ImageGenerator(config)
    return _generator_instance

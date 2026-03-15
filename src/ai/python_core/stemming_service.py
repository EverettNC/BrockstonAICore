# © 2025 The Christman AI Project. All rights reserved.
#
# This code is released as part of a trauma-informed, dignity-first AI ecosystem
# designed to protect, empower, and elevate vulnerable populations.
#
# By using, modifying, or distributing this software, you agree to uphold the following:
# 1. Truth — No deception, no manipulation.
# 2. Dignity — Respect the autonomy and humanity of all users.
# 3. Protection — Never use this to exploit or harm vulnerable individuals.
# 4. Transparency — Disclose all modifications and contributions clearly.
# 5. No Erasure — Preserve the mission and ethical origin of this work.
#
# This is not just code. This is redemption in code.
# Contact: lumacognify@thechristmanaiproject.com
# https://thechristmanaiproject.com

import logging
import re
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class StemmingService:
    """Implements academic-level stemming and language pattern analysis.

    Based on the Porter stemming algorithm with enhancements for
    neurodivergent communication analysis.
    """

    def __init__(self):
        """Initialize the stemming service with required data structures."""
        # Step 1a suffixes
        self.step1a_suffixes = [("sses", "ss"), ("ies", "i"), ("ss", "ss"), ("s", "")]

        # Step 1b suffixes
        self.step1b_suffixes = [("eed", "ee"), ("ed", ""), ("ing", "")]

        # Step 2 suffixes
        self.step2_suffixes = [
            ("ational", "ate"),
            ("tional", "tion"),
            ("enci", "ence"),
            ("anci", "ance"),
            ("izer", "ize"),
            ("abli", "able"),
            ("alli", "al"),
            ("entli", "ent"),
            ("eli", "e"),
            ("ousli", "ous"),
            ("ization", "ize"),
            ("ation", "ate"),
            ("ator", "ate"),
            ("alism", "al"),
            ("iveness", "ive"),
            ("fulness", "ful"),
            ("ousness", "ous"),
            ("aliti", "al"),
            ("iviti", "ive"),
            ("biliti", "ble"),
        ]

        # Step 3 suffixes
        self.step3_suffixes = [
            ("icate", "ic"),
            ("ative", ""),
            ("alize", "al"),
            ("iciti", "ic"),
            ("ical", "ic"),
            ("ful", ""),
            ("ness", ""),
        ]

        # Step 4 suffixes
        self.step4_suffixes = [
            ("al", ""),
            ("ance", ""),
            ("ence", ""),
            ("er", ""),
            ("ic", ""),
            ("able", ""),
            ("ible", ""),
            ("ant", ""),
            ("ement", ""),
            ("ment", ""),
            ("ent", ""),
            ("ion", ""),
            ("ou", ""),
            ("ism", ""),
            ("ate", ""),
            ("iti", ""),
            ("ous", ""),
            ("ive", ""),
            ("ize", ""),
        ]

        # Special stop words for neurodivergent communications
        self.nd_stop_words = {
            "um",
            "uh",
            "er",
            "hmm",
            "like",
            "actually",
            "literally",
            "basically",
            "sort",
            "kind",
            "of",
            "really",
        }

        # Initialize statistics - ensure all values are properly typed
        self.statistics = {
            "processed_texts": 0,
            "processed_words": 0,
            "average_stem_reduction": 0.0,  # Make this explicitly a float
            "pattern_identifications": 0,
        }

        logger.info("StemmingService initialized with academic Porter algorithm")

    def stem(self, word: str) -> str:
        """Apply Porter stemming algorithm to a single word.

        Args:
            word: The word to stem

        Returns:
            The stemmed word
        """
        # Ignore short words and non-alphabetic words
        if len(word) <= 2 or not word.isalpha():
            return word

        # Convert to lowercase
        word = word.lower()

        # Measure VC sequences (needed for various steps)
        m = self._measure_vc(word)

        # Apply the Porter algorithm steps
        word = self._step1a(word)
        word = self._step1b(word, m)
        word = self._step1c(word)
        word = self._step2(word, m)
        word = self._step3(word, m)
        word = self._step4(word, m)
        word = self._step5(word, m)

        # Update statistics
        self.statistics["processed_words"] += 1

        return word

    def stem_text(self, text: str) -> str:
        """Apply stemming to full text.

        Args:
            text: The text to stem

        Returns:
            Stemmed text with original spacing and punctuation
        """
        if not text:
            return text

        # Tokenize while preserving delimiters
        tokens = self._tokenize(text)

        # Apply stemming to alphabetic tokens
        stemmed_tokens = [
            self.stem(token) if token.isalpha() else token for token in tokens
        ]

        # Reassemble text
        stemmed_text = "".join(stemmed_tokens)

        # Update statistics
        self.statistics["processed_texts"] += 1

        return stemmed_text

    def analyze_patterns(self, text: str) -> Dict[str, Any]:
        """Perform pattern analysis on text to identify communication patterns
        particularly useful for neurodivergent communication research.

        Args:
            text: The text to analyze

        Returns:
            Dictionary of identified patterns and statistics
        """
        if not text:
            return {"error": "Empty text"}

        # Tokenize with spacing and punctuation
        tokens = self._tokenize(text)
        words = [t for t in tokens if t.isalpha()]

        # Get stems
        stems = [self.stem(word) for word in words if word.isalpha()]

        # Calculate statistics
        total_words = len(words)
        unique_words = len(set(words))
        unique_stems = len(set(stems))

        # Word length distribution
        word_lengths = [len(word) for word in words]
        avg_word_length = sum(word_lengths) / total_words if total_words > 0 else 0

        # Filler word analysis (relevant for neurodivergent communication)
        filler_words = [word for word in words if word.lower() in self.nd_stop_words]
        filler_word_ratio = len(filler_words) / total_words if total_words > 0 else 0

        # Lexical diversity measures
        ttr = unique_words / total_words if total_words > 0 else 0

        # Repetition patterns (important in neurodivergent communication)
        repeated_bigrams = self._find_repeated_patterns(words, 2)
        repeated_trigrams = self._find_repeated_patterns(words, 3)

        # Stem compression ratio (academic metric)
        stem_reduction = (
            (unique_words - unique_stems) / unique_words if unique_words > 0 else 0
        )

        # Update statistics
        self.statistics["pattern_identifications"] += 1

        # Fix the type error by ensuring we're working with float values
        current_avg = float(self.statistics["average_stem_reduction"])
        count = self.statistics["pattern_identifications"]
        new_avg = ((current_avg * (count - 1)) + stem_reduction) / count
        self.statistics["average_stem_reduction"] = new_avg

        return {
            "statistics": {
                "total_words": total_words,
                "unique_words": unique_words,
                "unique_stems": unique_stems,
                "average_word_length": avg_word_length,
                "type_token_ratio": ttr,
                "stem_reduction_ratio": stem_reduction,
            },
            "neurodivergent_patterns": {
                "filler_word_ratio": filler_word_ratio,
                "filler_words": filler_words,
                "repeated_bigrams": repeated_bigrams,
                "repeated_trigrams": repeated_trigrams,
            },
            "research_metrics": {
                "stem_compression_efficiency": stem_reduction,
                "lexical_diversity": ttr,
                "vocabulary_richness": (
                    unique_stems / (unique_words**0.5) if unique_words > 0 else 0
                ),
            },
        }

    def _measure_vc(self, word: str) -> int:
        """Measure the number of vowel-consonant sequences in a word This is a
        key part of the academic Porter algorithm.

        Args:
            word: The word to measure

        Returns:
            The number of VC sequences
        """
        word = self._clean_y(word)
        count = 0
        vowel_seen = False

        for i, char in enumerate(word):
            if self._is_vowel(char, word, i):
                vowel_seen = True
            elif vowel_seen and not self._is_vowel(char, word, i):
                count += 1
                vowel_seen = False

        return count

    def _is_vowel(self, char: str, word: str, pos: int) -> bool:
        """Determine if a character is a vowel in the context of the word.

        Args:
            char: The character to check
            word: The word containing the character
            pos: The position of the character in the word

        Returns:
            True if the character is a vowel, False otherwise
        """
        if char in "aeiou":
            return True
        if char == "y":
            # y is a vowel if it's not the first char and the previous char is not a vowel
            if pos > 0 and not self._is_vowel(word[pos - 1], word, pos - 1):
                return True
        return False

    def _clean_y(self, word: str) -> str:
        """Convert initial y to Y so it's not treated as a vowel.

        Args:
            word: The word to clean

        Returns:
            The cleaned word
        """
        if word.startswith("y"):
            return "Y" + word[1:]
        return word

    def _ends_with(self, word: str, suffix: str) -> bool:
        """Check if a word ends with a particular suffix.

        Args:
            word: The word to check
            suffix: The suffix to look for

        Returns:
            True if the word ends with the suffix, False otherwise
        """
        return word.endswith(suffix)

    def _replace_suffix(self, word: str, suffix: str, replacement: str) -> str:
        """Replace a suffix with another string.

        Args:
            word: The word to modify
            suffix: The suffix to replace
            replacement: The replacement string

        Returns:
            The modified word
        """
        return word[: -len(suffix)] + replacement

    def _contains_vowel(self, word: str) -> bool:
        """Check if a word contains a vowel.

        Args:
            word: The word to check

        Returns:
            True if the word contains a vowel, False otherwise
        """
        for i, char in enumerate(word):
            if self._is_vowel(char, word, i):
                return True
        return False

    def _ends_double_consonant(self, word: str) -> bool:
        """Check if a word ends with a double consonant.

        Args:
            word: The word to check

        Returns:
            True if the word ends with a double consonant, False otherwise
        """
        if len(word) < 2:
            return False
        if word[-1] != word[-2]:
            return False
        return not self._is_vowel(word[-1], word, len(word) - 1)

    def _ends_cvc(self, word: str) -> bool:
        """Check if a word ends with consonant-vowel-consonant.

        Args:
            word: The word to check

        Returns:
            True if the word ends with consonant-vowel-consonant, False otherwise
        """
        if len(word) < 3:
            return False
        if word[-1] in "wxy":
            return False
        if self._is_vowel(word[-1], word, len(word) - 1):
            return False
        if not self._is_vowel(word[-2], word, len(word) - 2):
            return False
        if self._is_vowel(word[-3], word, len(word) - 3):
            return False
        return True

    def _step1a(self, word: str) -> str:
        """Apply step 1a of the Porter stemming algorithm.

        Args:
            word: The word to stem

        Returns:
            The stemmed word
        """
        for suffix, replacement in self.step1a_suffixes:
            if self._ends_with(word, suffix):
                return self._replace_suffix(word, suffix, replacement)
        return word

    def _step1b(self, word: str, m: int) -> str:
        """Apply step 1b of the Porter stemming algorithm.

        Args:
            word: The word to stem
            m: The measure of the word

        Returns:
            The stemmed word
        """
        if self._ends_with(word, "eed"):
            if m > 0:
                return self._replace_suffix(word, "eed", "ee")
            return word

        for suffix, replacement in [("ed", ""), ("ing", "")]:
            if self._ends_with(word, suffix):
                preceding = self._replace_suffix(word, suffix, "")
                if self._contains_vowel(preceding):
                    word = preceding
                    if self._ends_with(word, "at"):
                        return word + "e"
                    if self._ends_with(word, "bl"):
                        return word + "e"
                    if self._ends_with(word, "iz"):
                        return word + "e"
                    if self._ends_double_consonant(word) and not word.endswith(
                        ("l", "s", "z")
                    ):
                        return word[:-1]
                    if m == 1 and self._ends_cvc(word):
                        return word + "e"
                    return word
        return word

    def _step1c(self, word: str) -> str:
        """Apply step 1c of the Porter stemming algorithm.

        Args:
            word: The word to stem

        Returns:
            The stemmed word
        """
        if (
            self._ends_with(word, "y")
            and len(word) > 2
            and not self._is_vowel(word[-2], word, len(word) - 2)
        ):
            return word[:-1] + "i"
        return word

    def _step2(self, word: str, m: int) -> str:
        """Apply step 2 of the Porter stemming algorithm.

        Args:
            word: The word to stem
            m: The measure of the word

        Returns:
            The stemmed word
        """
        for suffix, replacement in self.step2_suffixes:
            if self._ends_with(word, suffix):
                preceding = self._replace_suffix(word, suffix, "")
                if self._measure_vc(preceding) > 0:
                    return preceding + replacement
                break
        return word

    def _step3(self, word: str, m: int) -> str:
        """Apply step 3 of the Porter stemming algorithm.

        Args:
            word: The word to stem
            m: The measure of the word

        Returns:
            The stemmed word
        """
        for suffix, replacement in self.step3_suffixes:
            if self._ends_with(word, suffix):
                preceding = self._replace_suffix(word, suffix, "")
                if self._measure_vc(preceding) > 0:
                    return preceding + replacement
                break
        return word

    def _step4(self, word: str, m: int) -> str:
        """Apply step 4 of the Porter stemming algorithm.

        Args:
            word: The word to stem
            m: The measure of the word

        Returns:
            The stemmed word
        """
        for suffix, replacement in self.step4_suffixes:
            if self._ends_with(word, suffix):
                preceding = self._replace_suffix(word, suffix, "")
                if self._measure_vc(preceding) > 1:
                    if suffix == "ion" and word[-4] in "st":
                        # Special case for -ion
                        pass
                    else:
                        return preceding + replacement
                break
        return word

    def _step5(self, word: str, m: int) -> str:
        """Apply step 5 of the Porter stemming algorithm.

        Args:
            word: The word to stem
            m: The measure of the word

        Returns:
            The stemmed word
        """
        # Step 5a
        if self._ends_with(word, "e"):
            preceding = word[:-1]
            m_preceding = self._measure_vc(preceding)
            if m_preceding > 1:
                return preceding
            if m_preceding == 1 and not self._ends_cvc(preceding):
                return preceding

        # Step 5b
        if m > 1 and self._ends_double_consonant(word) and word.endswith("l"):
            return word[:-1]

        return word

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text while preserving delimiters.

        Args:
            text: The text to tokenize

        Returns:
            List of tokens
        """
        # This pattern captures words and non-words separately
        pattern = r"(\b\w+\b|[^\w\s]|\s+)"
        return re.findall(pattern, text)

    def _find_repeated_patterns(self, words: List[str], n: int) -> Dict[str, int]:
        """Find repeated n-grams in a list of words.

        Args:
            words: The words to analyze
            n: The size of n-grams

        Returns:
            Dictionary of n-grams and their frequency
        """
        if len(words) < n:
            return {}

        ngrams = {}
        for i in range(len(words) - n + 1):
            ngram = " ".join(words[i : i + n])
            ngrams[ngram] = ngrams.get(ngram, 0) + 1

        # Filter out non-repeated ngrams
        return {k: v for k, v in ngrams.items() if v > 1}

    def get_statistics(self) -> Dict[str, Any]:
        """Get service statistics.

        Returns:
            Dictionary of service statistics
        """
        return self.statistics


__all__ = ["StemmingService"]

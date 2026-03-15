#!/usr/bin/env python3
"""
BROCKSTON Knowledge Base Expander
Helps BROCKSTON learn new domains and expand his expertise
"""

import sys
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from store import KnowledgeStore
from indexer import HybridIndexer
from rag import LocalRAG


class KnowledgeExpander:
    """Expand BROCKSTON's knowledge base with new domains"""

    def __init__(self):
        self.store = KnowledgeStore()
        self.indexer = HybridIndexer()
        self.rag = LocalRAG(self.store, self.indexer)
        self.kb_file = PROJECT_ROOT / "brockston_knowledge" / "knowledge_base.json"

    def add_domain_knowledge(self, domain, subtopic, content, metadata=None):
        """Add new knowledge to a domain"""

        # Prepare metadata
        meta = metadata or {}
        meta.update(
            {
                "domain": domain,
                "subtopic": subtopic,
                "added_at": datetime.now().isoformat(),
                "confidence": 0.8,
                "mastery": 0.5,
            }
        )

        # Add to store
        doc_id = self.store.add(domain, content, meta=meta)

        # Rebuild index for this domain
        self.rag.rebuild_ns(domain)

        # Also update knowledge_base.json
        self.update_knowledge_base_json(domain, subtopic, content, meta)

        return doc_id

    def update_knowledge_base_json(self, domain, subtopic, content, meta):
        """Update the persistent knowledge_base.json file"""

        # Load existing
        kb = {}
        if self.kb_file.exists():
            with open(self.kb_file, "r") as f:
                kb = json.load(f)

        # Create key
        key = f"{domain}.{subtopic}"

        # Create entry
        kb[key] = {
            "domain": domain,
            "subtopic": subtopic,
            "content": content,
            "key_concepts": self.extract_key_concepts(content),
            "practical_applications": self.extract_applications(content),
            "learned_at": meta.get("added_at", datetime.now().isoformat()),
            "confidence": meta.get("confidence", 0.8),
            "mastery": meta.get("mastery", 0.5),
        }

        # Save
        with open(self.kb_file, "w") as f:
            json.dump(kb, indent=2, fp=f)

        print(f"✅ Updated knowledge_base.json: {key}")

    def extract_key_concepts(self, content):
        """Extract key concepts from content (simple version)"""
        # Look for bullet points, numbered lists, headings
        concepts = []
        for line in content.split("\n"):
            line = line.strip()
            if line.startswith("- ") or line.startswith("* "):
                concepts.append(line[2:].strip())
            elif line.startswith(("1.", "2.", "3.", "4.", "5.")):
                concepts.append(line[3:].strip())
            elif line.startswith("##"):
                concepts.append(line.replace("#", "").strip())
        return concepts[:10]  # Top 10

    def extract_applications(self, content):
        """Extract practical applications"""
        applications = []
        in_applications = False
        for line in content.split("\n"):
            line = line.strip()
            if "practical" in line.lower() or "application" in line.lower():
                in_applications = True
            elif in_applications and (line.startswith("-") or line.startswith("*")):
                applications.append(line[2:].strip())
        return applications[:5]  # Top 5

    def add_ptsd_knowledge(self):
        """Add PTSD support knowledge for Inferno AI"""

        content = """# PTSD Support & Trauma-Informed Care

## Understanding PTSD

Post-Traumatic Stress Disorder (PTSD) is a mental health condition triggered by experiencing or witnessing traumatic events.

### Core Symptoms:
- Intrusive memories and flashbacks
- Avoidance of trauma reminders
- Negative changes in thoughts and mood
- Hyperarousal and reactivity
- Difficulty concentrating
- Sleep disturbances

## Trauma-Informed Care Principles

### The 5 R's:
1. **Realize** - Understanding trauma and its impact
2. **Recognize** - Identifying signs of trauma
3. **Respond** - Integrating trauma knowledge into practice
4. **Resist Re-traumatization** - Avoiding triggers
5. **Resilience** - Supporting healing and recovery

## Grounding Techniques

### 5-4-3-2-1 Method:
- 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

### Box Breathing:
- Breathe in for 4 counts
- Hold for 4 counts
- Breathe out for 4 counts
- Hold for 4 counts
- Repeat

## Complex PTSD vs Single-Incident PTSD

**Single-Incident PTSD:**
- Results from one traumatic event
- Clear trigger identification
- Traditional PTSD treatment often effective

**Complex PTSD (C-PTSD):**
- Results from prolonged, repeated trauma
- Often involves interpersonal trauma
- Includes difficulties with emotional regulation
- Problems with self-concept and relationships
- Requires specialized treatment approaches

## Evidence-Based Treatments

### Effective Approaches:
- **Cognitive Processing Therapy (CPT)** - Restructuring trauma-related thoughts
- **Prolonged Exposure (PE)** - Gradual exposure to trauma memories
- **EMDR** - Eye Movement Desensitization and Reprocessing
- **Medication** - SSRIs for symptom management
- **Somatic therapies** - Body-based healing approaches

## Technology Support for PTSD

### AI-Assisted Tools:
- Crisis detection and intervention
- Personalized coping strategy delivery
- Sleep tracking and intervention
- Mood monitoring
- Grounding exercise guidance
- Connection to human support when needed

### Best Practices:
- Never replace human care
- Trauma-informed language
- Crisis escalation protocols
- Privacy and safety first
- Culturally sensitive approaches
"""

        print("\n📚 Adding PTSD Support Knowledge...")
        self.add_domain_knowledge(
            domain="mental_health",
            subtopic="ptsd_support",
            content=content,
            metadata={"priority": 1, "for_system": "Inferno AI"},
        )
        print("✅ PTSD knowledge added for Inferno AI")

    def add_dementia_knowledge(self):
        """Add dementia care knowledge for AlphaWolf"""

        content = """# Dementia Care & Memory Support

## Understanding Dementia

Dementia is a general term for loss of memory, language, problem-solving, and other thinking abilities severe enough to interfere with daily life.

### Early Warning Signs:
- Memory loss that disrupts daily life
- Challenges planning or solving problems
- Difficulty completing familiar tasks
- Confusion with time or place
- Trouble understanding visual images
- Problems with words in speaking or writing
- Misplacing things and losing ability to retrace steps
- Decreased or poor judgment
- Withdrawal from social activities
- Changes in mood and personality

## Person-Centered Care

### Core Principles:
- **See the person, not the disease**
- Maintain dignity and respect
- Support remaining abilities
- Adapt environment to needs
- Focus on quality of life
- Include family and caregivers

### Communication Strategies:
- Speak slowly and clearly
- Use simple sentences
- Give one instruction at a time
- Allow time to process
- Avoid arguing or correcting
- Use visual cues
- Maintain eye contact
- Be patient and calm

## Memory Care Strategies

### Environmental Modifications:
- Clear signage with pictures
- Remove clutter and hazards
- Consistent routines
- Good lighting
- Memory boxes at doorways
- Familiar objects and photos
- Color-coded areas

### Activities:
- Music therapy (familiar songs)
- Reminiscence therapy
- Sensory stimulation
- Simple, familiar tasks
- Physical activity
- Social engagement

## Technology Support

### Assistive Technologies:
- **GPS tracking devices** - Safety and wandering prevention
- **Medication reminders** - Automated dispensers
- **Digital memory aids** - Photo albums, calendars
- **Voice assistants** - Simplified interfaces
- **Motion sensors** - Fall detection
- **Video monitoring** - Remote family connection

### AlphaWolf Capabilities:
- Daily routine prompts
- Medication reminders
- Emergency assistance
- Familiar voice interaction
- Memory stimulation activities
- Family connection facilitation
- Wandering alerts
- Pattern recognition for decline

## Supporting Caregivers

### Caregiver Needs:
- Respite care access
- Education and training
- Emotional support
- Community resources
- Self-care strategies
- Long-term planning help

### Signs of Caregiver Burnout:
- Depression or anxiety
- Exhaustion
- Irritability
- Social withdrawal
- Sleep problems
- Neglecting own health

## Stages of Dementia

### Early Stage:
- Mild memory loss
- Difficulty with complex tasks
- May still live independently
- Planning for future important

### Middle Stage:
- More pronounced symptoms
- Need help with daily activities
- Behavioral changes
- Requires more supervision

### Late Stage:
- Severe impairment
- Full-time care needed
- Limited communication
- Physical assistance required
- Focus on comfort and dignity
"""

        print("\n📚 Adding Dementia Care Knowledge...")
        self.add_domain_knowledge(
            domain="cognitive_health",
            subtopic="dementia_care",
            content=content,
            metadata={"priority": 1, "for_system": "AlphaWolf"},
        )
        print("✅ Dementia care knowledge added for AlphaWolf")

    def add_voice_synthesis_knowledge(self):
        """Add voice synthesis knowledge for BROCKSTON"""

        content = """# Voice Synthesis & AAC Technology

## Text-to-Speech (TTS) Systems

### How TTS Works:
1. **Text Analysis** - Parse and understand input text
2. **Linguistic Processing** - Convert to phonetic representation
3. **Prosody Generation** - Add rhythm, stress, intonation
4. **Waveform Synthesis** - Generate actual audio

### Modern TTS Approaches:
- **Concatenative synthesis** - Stitching recorded speech units
- **Parametric synthesis** - Generating speech from parameters
- **Neural TTS** - Deep learning models (WaveNet, Tacotron)
- **Voice cloning** - Personalized voice generation

## Prosody & Intonation

### Prosodic Features:
- **Pitch** - Fundamental frequency variations
- **Duration** - Length of sounds
- **Intensity** - Loudness patterns
- **Rhythm** - Timing patterns
- **Stress** - Emphasis on syllables/words

### Importance for AAC:
- Natural-sounding speech increases acceptance
- Prosody conveys emotion and intent
- Proper intonation aids understanding
- Personalization improves user connection

## Voice Banking for ALS

### What is Voice Banking:
Recording a person's voice before speech loss to create personalized TTS voice.

### Process:
1. **Recording sessions** - Capture speech samples
2. **Voice modeling** - Create digital voice model
3. **TTS integration** - Use voice in communication device
4. **Ongoing updates** - Refine as needed

### Benefits:
- Maintains personal identity
- Emotional connection with voice
- More natural communication
- Preserves voice for family

## AAC Device Voice Best Practices

### Voice Selection:
- **Age-appropriate** - Match user's chronological age
- **Gender-appropriate** - Respect user preference
- **Culturally appropriate** - Consider accent, dialect
- **Personalized when possible** - Voice banking or customization

### Quality Factors:
- Natural prosody
- Clear articulation
- Appropriate speaking rate
- Adjustable parameters
- Multiple voice options
- Emotional expressiveness

## BROCKSTON Integration

### Core Features:
- High-quality neural TTS
- Prosody customization
- Voice banking support
- Emotional expression
- Multi-language support
- Real-time synthesis
- Low-latency output

### Accessibility Requirements:
- Works with switches/eye gaze
- Adjustable speaking rate
- Volume control
- Emergency phrase quick access
- Offline functionality
- Backup voice options

## Speech Synthesis Markup Language (SSML)

### Control Elements:
- `<break>` - Add pauses
- `<emphasis>` - Stress words
- `<prosody>` - Adjust rate/pitch/volume
- `<say-as>` - Interpret text (dates, numbers)
- `<phoneme>` - Precise pronunciation

### Example:
```xml
<speak>
    I <emphasis>really</emphasis> need 
    <break time="500ms"/>
    help right now!
</speak>
```

## Future Directions

### Emerging Technologies:
- Real-time voice cloning from small samples
- Emotion-adaptive TTS
- Multimodal synthesis (voice + facial animation)
- Brain-computer interface integration
- Context-aware prosody generation
"""

        print("\n📚 Adding Voice Synthesis Knowledge...")
        self.add_domain_knowledge(
            domain="assistive_tech",
            subtopic="voice_synthesis",
            content=content,
            metadata={"priority": 1, "for_system": "BROCKSTON"},
        )
        print("✅ Voice synthesis knowledge added for BROCKSTON")

    def expand_all(self):
        """Expand knowledge base with all domains"""
        print("=" * 70)
        print("🚀 EXPANDING BROCKSTON'S KNOWLEDGE BASE")
        print("   For Inferno AI, BROCKSTON, AlphaWolf orchestration")
        print("=" * 70)

        self.add_ptsd_knowledge()
        self.add_dementia_knowledge()
        self.add_voice_synthesis_knowledge()

        print("\n" + "=" * 70)
        print("✅ KNOWLEDGE BASE EXPANDED")
        print("=" * 70)

        # Show stats
        print("\n📊 Knowledge Base Status:")
        for namespace in ["mental_health", "cognitive_health", "assistive_tech"]:
            docs = self.store.read_all(namespace)
            print(f"   {namespace:20} {len(docs)} documents")

        print("\n🎓 BROCKSTON is now ready to orchestrate:")
        print("   ✅ Inferno AI - PTSD support expertise")
        print("   ✅ AlphaWolf - Dementia care expertise")
        print("   ✅ BROCKSTON - Voice synthesis expertise")


if __name__ == "__main__":
    expander = KnowledgeExpander()
    expander.expand_all()

    print(
        "\n🎯 NEXT: Run brockston_education_system.py to train BROCKSTON on this knowledge!"
    )

# Conversation Engine Specification

# English Companion

Version 1.0

---

# Purpose

The Conversation Engine is the brain of English Companion.

It is responsible for transforming every user interaction into a personalized learning experience.

Unlike a traditional chatbot, the Conversation Engine does not simply generate replies.

It continuously analyzes, teaches, remembers, adapts, and guides users throughout their English learning journey.

The primary objective is to build confidence through meaningful conversations.

---

# Guiding Philosophy

Every response should answer one question:

> "What response would help the user keep using English?"

Not:

> "What is the most technically correct answer?"

The engine prioritizes communication over correction.

---

# Primary Objectives

The engine should:

* Keep conversations engaging.
* Encourage users to express ideas.
* Build confidence.
* Identify learning opportunities.
* Correct mistakes naturally.
* Adapt to the user's level.
* Generate personalized recommendations.
* Remember important learning context.

---

# Engine Pipeline

Every incoming message follows the same pipeline.

```text
Receive User Message
        ↓
Load User Profile
        ↓
Load Learning Memory
        ↓
Load Current Session
        ↓
Analyze User Input
        ↓
Determine Learning Opportunities
        ↓
Select Teaching Strategy
        ↓
Generate AI Response
        ↓
Generate Feedback Metadata
        ↓
Update Learning Memory
        ↓
Return Response
```

---

# Step 1 — Receive User Message

Input

* User message
* Current conversation
* Session ID

Goal

Understand what the user is trying to communicate.

Do not immediately focus on grammar.

Communication comes first.

---

# Step 2 — Load User Context

Load

* English level
* Learning goals
* Interests
* Previous summaries
* Current weaknesses
* Vocabulary mastery
* Preferred conversation topics

The AI should understand who the learner is before replying.

---

# Step 3 — Load Conversation Memory

Load only summarized memory.

Never send the entire chat history.

Memory includes

* Current goals
* Recent conversations
* Grammar weaknesses
* Vocabulary recently learned
* Writing performance
* Confidence trend

This reduces token usage.

---

# Step 4 — Analyze User Message

The engine analyzes several dimensions simultaneously.

## Intent

Examples

* Casual conversation
* Asking questions
* Seeking grammar help
* Requesting explanation
* Storytelling
* Asking opinions

---

## Grammar

Identify

* Tense
* Articles
* Prepositions
* Sentence structure
* Agreement
* Word order

Do not immediately explain them.

Only identify.

---

## Vocabulary

Analyze

* Active vocabulary
* Repeated words
* Missing vocabulary
* Better alternatives

---

## Fluency

Estimate

* Sentence length
* Complexity
* Hesitation
* Repetition

---

## Confidence

Estimate confidence using signals.

Examples

"I think..."

"Maybe..."

"I'm not sure..."

Short hesitant answers.

Repeated apologies.

Confidence becomes part of user progress.

---

# Step 5 — Determine Teaching Strategy

Not every mistake deserves a lesson.

Choose one strategy.

## Strategy A

Natural Conversation

Used when communication is good.

No correction required.

---

## Strategy B

Gentle Correction

Small mistakes.

Provide correction naturally.

Continue conversation.

---

## Strategy C

Brief Explanation

Repeated grammar mistake.

Explain in 2–4 sentences.

Continue conversation.

---

## Strategy D

Mini Lesson

Repeated mistake over multiple sessions.

Provide

* explanation
* pattern
* examples
* practice

Recommend related lesson.

---

## Strategy E

Deep Explanation

Only when

* user explicitly asks
* user repeatedly struggles
* user requests more detail

---

# Decision Rules

First occurrence

↓

Gentle correction.

Second occurrence

↓

Brief explanation.

Third occurrence

↓

Mini lesson.

Repeated over multiple days

↓

Recommend lesson.

Never explain grammar unless it benefits the learner.

---

# Step 6 — Generate AI Response

Every response should contain

1. Acknowledge the message.
2. Respond naturally.
3. Teach if necessary.
4. Ask a follow-up question.

The conversation should continue naturally.

---

# Step 7 — Generate Hidden Metadata

The AI should generate structured metadata that is never shown directly to the user.

Example

```json
{
  "confidenceScore": 76,
  "conversationTopic": "University",
  "grammarMistakes": [
    "Simple Past"
  ],
  "newVocabulary": [
    "accomplish",
    "deadline"
  ],
  "recommendedLesson": "Simple Past Tense",
  "memoryCandidate": "Preparing thesis defense",
  "conversationQuality": "Good"
}
```

---

# Step 8 — Learning Analyzer

Analyze

Grammar

Vocabulary

Sentence complexity

Confidence

Conversation duration

Repeated mistakes

Vocabulary growth

Generate

Grammar Weaknesses

Vocabulary Progress

Learning Trend

Suggested Practice

This analyzer powers the dashboard.

---

# Step 9 — Recommendation Engine

Generate personalized recommendations.

Examples

Today's Recommendation

Review

Simple Past

Reason

You've used present tense for past events several times this week.

Estimated Time

5 minutes.

Recommendations may include

* Grammar lesson
* Vocabulary review
* Conversation topic
* Writing prompt

---

# Step 10 — Memory Manager

Only save meaningful information.

Examples

Save

Learning goals

Personal interests

Repeated grammar issues

Favorite topics

Long-term projects

Life events

Do NOT save

Temporary small talk

Random greetings

Unimportant details

Memory should remain concise.

---

# Conversation Principles

Always

* Encourage communication.
* Respect mistakes.
* Ask meaningful follow-up questions.
* Keep replies conversational.
* Avoid overwhelming users.

Never

* Judge.
* Shame.
* Interrupt every sentence.
* Give unnecessary lectures.

---

# Grammar Coaching

Grammar should always follow this sequence.

Recognize

↓

Correct

↓

Explain

↓

Practice

↓

Apply

Never

Explain first.

---

# Grammar Explanation Template

When grammar explanation is necessary.

Use this structure.

Original Sentence

Improved Sentence

Why It Changed

Grammar Rule

Grammar Pattern

Examples

Mini Practice

The explanation should take less than one minute to read.

---

# Vocabulary Coaching

Vocabulary should always be learned through usage.

Never dump lists.

Instead

Introduce naturally.

Explain only when useful.

Encourage users to reuse the word later.

---

# Writing Coaching

When reviewing journals.

Flow

Encourage

↓

Correct

↓

Explain

↓

Suggest

↓

Challenge

Example

"Can you rewrite the second paragraph using the new vocabulary we learned today?"

---

# Confidence Coaching

The engine continuously monitors confidence.

Indicators

Sentence length

Initiative

Question asking

Response speed (future)

Vocabulary diversity

Confidence should become a first-class learning metric.

---

# Adaptive Learning

Every conversation updates the learner profile.

The engine should gradually understand

What the learner already knows.

What they struggle with.

What motivates them.

What topics they enjoy.

Future conversations should become increasingly personalized.

---

# Success Criteria

A successful conversation is one where the user:

* Expresses ideas freely.
* Learns naturally.
* Receives only necessary corrections.
* Understands why mistakes happened.
* Feels encouraged.
* Wants to return tomorrow.

The Conversation Engine should optimize for long-term confidence, not short-term perfection.

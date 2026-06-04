import type { Stage, ValidationWarning } from '../data/types'

type Rule = (stage: Stage) => ValidationWarning[]

const hasType = (stage: Stage, type: string) =>
  stage.beats.some(b => b.type === type)

const firstPositionOf = (stage: Stage, type: string) => {
  const beat = stage.beats.find(b => b.type === type)
  return beat ? beat.position : Infinity
}

// ─── Individual rules ─────────────────────────────────────────────────────────

const ruleEmptyStage: Rule = stage => {
  if (stage.beats.length === 0) {
    return [{ stageId: stage.id, rule: 'EMPTY_STAGE', message: 'Stage has no beats.', severity: 'error' }]
  }
  return []
}

const ruleMissingArrival: Rule = stage => {
  if (!hasType(stage, 'ARRIVAL')) {
    return [{ stageId: stage.id, rule: 'MISSING_ARRIVAL', message: 'No ARRIVAL beat found.', severity: 'warning' }]
  }
  return []
}

const ruleMissingKnowledge: Rule = stage => {
  if (!hasType(stage, 'KNOWLEDGE')) {
    return [{ stageId: stage.id, rule: 'MISSING_KNOWLEDGE', message: 'No KNOWLEDGE beat found. Players cannot discover the concept.', severity: 'error' }]
  }
  return []
}

const ruleEncounterBeforeKnowledge: Rule = stage => {
  const firstKnowledge = firstPositionOf(stage, 'KNOWLEDGE')
  return stage.beats
    .filter(b => b.type === 'ENCOUNTER' && b.position < firstKnowledge)
    .map(b => ({
      stageId: stage.id,
      beatId: b.id,
      rule: 'ENCOUNTER_BEFORE_KNOWLEDGE',
      message: `ENCOUNTER beat "${b.payload.title}" appears before any KNOWLEDGE beat. Players will be tested before they can learn.`,
      severity: 'warning' as const,
    }))
}

const ruleMissingBoss: Rule = stage => {
  if (!hasType(stage, 'BOSS')) {
    return [{ stageId: stage.id, rule: 'MISSING_BOSS', message: 'No BOSS beat found. Stage has no mastery validation.', severity: 'warning' }]
  }
  return []
}

const rulePortalWithoutBoss: Rule = stage => {
  if (hasType(stage, 'PORTAL') && !hasType(stage, 'BOSS')) {
    return [{ stageId: stage.id, rule: 'PORTAL_WITHOUT_BOSS', message: 'PORTAL beat present but no BOSS beat. Stage exits without mastery validation.', severity: 'warning' }]
  }
  return []
}

const ruleBossConceptNotIntroduced: Rule = stage => {
  const bossBeats = stage.beats.filter(b => b.type === 'BOSS')
  const knowledgeConceptRefs = new Set(
    stage.beats.filter(b => b.type === 'KNOWLEDGE').map(b => b.payload.conceptRef).filter(Boolean)
  )
  const warnings: ValidationWarning[] = []
  for (const boss of bossBeats) {
    for (const required of boss.payload.conceptsRequired ?? []) {
      if (!knowledgeConceptRefs.has(required)) {
        warnings.push({
          stageId: stage.id,
          beatId: boss.id,
          rule: 'BOSS_CONCEPT_NOT_INTRODUCED',
          message: `Boss "${boss.payload.title}" requires concept "${required}" but no KNOWLEDGE beat introduces it.`,
          severity: 'warning',
        })
      }
    }
  }
  return warnings
}

// ─── Registry — add new rules here ─────────────────────────────────────────────
// FUTURE: rules can be registered dynamically (e.g., campaign-specific rule sets)

const ALL_RULES: Rule[] = [
  ruleEmptyStage,
  ruleMissingArrival,
  ruleMissingKnowledge,
  ruleEncounterBeforeKnowledge,
  ruleMissingBoss,
  rulePortalWithoutBoss,
  ruleBossConceptNotIntroduced,
]

export function validateStage(stage: Stage): ValidationWarning[] {
  return ALL_RULES.flatMap(rule => rule(stage))
}

export function validateCampaign(campaign: import('../data/types').Campaign): ValidationWarning[] {
  return campaign.acts.flatMap(act => act.stages.flatMap(stage => validateStage(stage)))
}

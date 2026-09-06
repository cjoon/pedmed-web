import { ANESTHETICS, CARPULE_ML } from "./data/anesthetics";

export function carpulesToMg(agentIdx, carpules) {
  const agent = ANESTHETICS[agentIdx];
  if (!agent || !carpules) return null;
  return agent.concentrationMgMl * CARPULE_ML * carpules;
}

// Returns null when the agent's clinical max mg/kg isn't confirmed yet (see
// src/chart/data/anesthetics.js) — callers must not warn without a known max.
export function maxAllowedMg(agentIdx, weightKg) {
  const agent = ANESTHETICS[agentIdx];
  if (!agent || !agent.maxMgPerKg || !weightKg) return null;
  const byWeight = agent.maxMgPerKg * weightKg;
  return agent.absoluteMaxMg ? Math.min(byWeight, agent.absoluteMaxMg) : byWeight;
}

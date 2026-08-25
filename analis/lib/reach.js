const { AI_AGENTS, allowsAgent } = require('./fetch');

function computeReach(robots, noindex, pathname) {
  const path = pathname || '/';
  const states = [];
  const systems = [];
  for (const agent of AI_AGENTS) {
    systems.push({ label: agent.label, owner: agent.owner });
    if (noindex) {
      states.push(2);
      continue;
    }
    if (!robots.exists) {
      states.push(0);
      continue;
    }
    states.push(allowsAgent(robots.groups, agent.label, path) ? 0 : 2);
  }
  const counts = [0, 0, 0];
  for (const s of states) counts[s]++;
  return { systems, states, counts };
}

module.exports = { computeReach };

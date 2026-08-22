const { AI_AGENTS, findRobotsEntry, isBlocked } = require('./fetch');

function computeReach(robots, noindex) {
  const states = [];
  const systems = [];
  for (const agent of AI_AGENTS) {
    systems.push({ label: agent.label, owner: agent.owner });
    if (noindex) {
      states.push(2);
      continue;
    }
    if (!robots.exists) {
      states.push(1);
      continue;
    }
    const entry = findRobotsEntry(robots.groups, [agent.label]);
    if (entry.specific && isBlocked(entry.specific)) states.push(2);
    else if (entry.wildcard && isBlocked(entry.wildcard)) states.push(2);
    else states.push(0);
  }
  const counts = [0, 0, 0];
  for (const s of states) counts[s]++;
  return { systems, states, counts };
}

module.exports = { computeReach };
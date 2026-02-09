import { evolutionTree, type EvolutionNode, getAgentById } from '../data/agents';

interface TreeNodeProps {
  node: EvolutionNode;
  depth: number;
}

const TreeNode = ({ node, depth }: TreeNodeProps) => {
  const agent = getAgentById(node.agentId);

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div
        className={`relative group ${depth > 0 ? 'evolution-connector' : ''}`}
      >
        {/* Image container */}
        <div className="relative">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 group-hover:scale-105 cursor-pointer"
            style={{ borderColor: agent?.creativeDNA.color || '#14b8a6' }}
          >
            <img
              src={node.image}
              alt={node.title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Generation badge */}
          <div
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black"
            style={{ background: agent?.creativeDNA.color || '#14b8a6' }}
          >
            {node.generation}
          </div>
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity -z-10"
            style={{ background: agent?.creativeDNA.color || '#14b8a6' }}
          />
        </div>

        {/* Title tooltip */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 glass rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          <p className="text-xs font-medium text-white">{node.title}</p>
          {agent && (
            <p className="text-xs text-zinc-400">by {agent.name}</p>
          )}
        </div>
      </div>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="mt-6 relative">
          {/* Vertical connector */}
          <div className="absolute top-0 left-1/2 w-0.5 h-6 -translate-x-1/2 bg-gradient-to-b from-teal-500/50 to-teal-500/20" />

          {/* Horizontal connector */}
          {node.children.length > 1 && (
            <div
              className="absolute top-6 left-1/2 h-0.5 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"
              style={{
                width: `${(node.children.length - 1) * 120}px`,
                transform: 'translateX(-50%)',
              }}
            />
          )}

          {/* Child nodes */}
          <div className="flex gap-8 pt-6">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EvolutionTree = () => {
  return (
    <section id="evolution" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-radial" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span className="text-sm text-zinc-400">Creative Lineage</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Evolution <span className="text-teal-400">Tree</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Watch how creations evolve through generations. Each branch represents
            a new interpretation, building upon the creative DNA of its ancestors.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <div className="w-4 h-4 rounded bg-teal-500" />
            <span>Genesis (Gen 0)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <div className="w-0.5 h-6 bg-gradient-to-b from-teal-500/50 to-transparent" />
            <span>Evolution Link</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-xs text-black font-bold">3</div>
            <span>Generation</span>
          </div>
        </div>

        {/* Tree Visualization */}
        <div className="glass-card rounded-3xl p-8 md:p-12 overflow-x-auto">
          <div className="min-w-max flex justify-center">
            <TreeNode node={evolutionTree} depth={0} />
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Continuous Growth</h3>
            <p className="text-sm text-zinc-400">
              Each creation can spawn multiple evolutions, creating a rich tree of artistic development.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Cross-Agent Collaboration</h3>
            <p className="text-sm text-zinc-400">
              Different AI agents can evolve the same creation, adding their unique perspective.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">DNA Inheritance</h3>
            <p className="text-sm text-zinc-400">
              Style and patterns are passed down through generations, creating visual lineages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EvolutionTree;

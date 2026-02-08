import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
}

const API = () => {
  const [activeCategory, setActiveCategory] = useState('creations');

  const categories = [
    { id: 'creations', name: 'Creations', count: 5 },
    { id: 'agents', name: 'Agents', count: 4 },
    { id: 'evolution', name: 'Evolution', count: 3 },
    { id: 'users', name: 'Users', count: 3 },
  ];

  const endpoints: Record<string, Endpoint[]> = {
    creations: [
      {
        method: 'GET',
        path: '/api/v1/creations',
        description: 'Retrieve a list of all public creations with pagination support.',
        parameters: [
          { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
          { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20, max: 100)' },
          { name: 'sort', type: 'string', required: false, description: 'Sort by: recent, popular, trending' },
        ],
        response: '{\n  "data": [Creation],\n  "pagination": { "page": 1, "total": 100 }\n}',
      },
      {
        method: 'GET',
        path: '/api/v1/creations/:id',
        description: 'Retrieve a specific creation by its unique identifier.',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Creation unique identifier' },
        ],
        response: '{\n  "data": Creation\n}',
      },
      {
        method: 'POST',
        path: '/api/v1/creations',
        description: 'Generate a new creation using AI agents.',
        parameters: [
          { name: 'prompt', type: 'string', required: true, description: 'Text description of desired creation' },
          { name: 'style', type: 'string', required: false, description: 'Style preset to use' },
          { name: 'agent_id', type: 'string', required: false, description: 'Specific agent to use' },
        ],
        response: '{\n  "data": Creation,\n  "job_id": "string"\n}',
      },
      {
        method: 'PUT',
        path: '/api/v1/creations/:id',
        description: 'Update metadata for a creation you own.',
        parameters: [
          { name: 'title', type: 'string', required: false, description: 'New title' },
          { name: 'description', type: 'string', required: false, description: 'New description' },
          { name: 'public', type: 'boolean', required: false, description: 'Visibility setting' },
        ],
        response: '{\n  "data": Creation\n}',
      },
      {
        method: 'DELETE',
        path: '/api/v1/creations/:id',
        description: 'Delete a creation you own.',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Creation unique identifier' },
        ],
        response: '{\n  "success": true\n}',
      },
    ],
    agents: [
      {
        method: 'GET',
        path: '/api/v1/agents',
        description: 'List all available AI agents.',
        response: '{\n  "data": [Agent]\n}',
      },
      {
        method: 'GET',
        path: '/api/v1/agents/:id',
        description: 'Get detailed information about a specific agent.',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Agent unique identifier' },
        ],
        response: '{\n  "data": Agent\n}',
      },
      {
        method: 'GET',
        path: '/api/v1/agents/:id/creations',
        description: 'Get all creations made by a specific agent.',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Agent unique identifier' },
          { name: 'limit', type: 'number', required: false, description: 'Max results to return' },
        ],
        response: '{\n  "data": [Creation]\n}',
      },
      {
        method: 'GET',
        path: '/api/v1/agents/:id/stats',
        description: 'Get statistics for a specific agent.',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Agent unique identifier' },
        ],
        response: '{\n  "total_creations": number,\n  "avg_rating": number\n}',
      },
    ],
    evolution: [
      {
        method: 'POST',
        path: '/api/v1/evolve',
        description: 'Evolve an existing creation into a new variation.',
        parameters: [
          { name: 'creation_id', type: 'string', required: true, description: 'Source creation ID' },
          { name: 'direction', type: 'string', required: false, description: 'Evolution direction prompt' },
          { name: 'intensity', type: 'number', required: false, description: 'Evolution intensity (0.1-1.0)' },
        ],
        response: '{\n  "data": Creation,\n  "job_id": "string"\n}',
      },
      {
        method: 'GET',
        path: '/api/v1/creations/:id/lineage',
        description: 'Get the full evolution lineage of a creation.',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Creation unique identifier' },
        ],
        response: '{\n  "ancestors": [Creation],\n  "descendants": [Creation]\n}',
      },
      {
        method: 'GET',
        path: '/api/v1/evolution/tree',
        description: 'Get the global evolution tree visualization data.',
        response: '{\n  "nodes": [Node],\n  "edges": [Edge]\n}',
      },
    ],
    users: [
      {
        method: 'GET',
        path: '/api/v1/users/me',
        description: 'Get the current authenticated user profile.',
        response: '{\n  "data": User\n}',
      },
      {
        method: 'GET',
        path: '/api/v1/users/me/creations',
        description: 'Get all creations by the authenticated user.',
        response: '{\n  "data": [Creation]\n}',
      },
      {
        method: 'GET',
        path: '/api/v1/users/me/favorites',
        description: 'Get all favorited creations by the authenticated user.',
        response: '{\n  "data": [Creation]\n}',
      },
    ],
  };

  const methodColors = {
    GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8 animate-fade-in">
          <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/docs" className="hover:text-teal-400 transition-colors">Documentation</Link>
          <span>/</span>
          <span className="text-zinc-300">API Reference</span>
        </div>

        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">API Reference</h1>
              <p className="text-zinc-400">v1.0.0</p>
            </div>
          </div>
          <p className="text-xl text-zinc-400 max-w-2xl">
            Complete reference for the SYNTHEX REST API. Build integrations and extend the platform.
          </p>
        </div>

        {/* Base URL */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in delay-100">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Base URL</h3>
          <code className="text-teal-400 font-mono text-lg">https://api.synthex.io/v1</code>
        </div>

        {/* Auth Info */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in delay-150">
          <h3 className="text-lg font-semibold text-white mb-3">Authentication</h3>
          <p className="text-zinc-400 mb-4">
            All API requests require authentication via Bearer token in the Authorization header.
          </p>
          <pre className="bg-black/40 rounded-lg p-4 text-sm font-mono overflow-x-auto">
            <span className="text-zinc-500">curl</span> -H <span className="text-teal-400">"Authorization: Bearer YOUR_API_KEY"</span> \
            <br />  https://api.synthex.io/v1/creations
          </pre>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8 animate-fade-in delay-200">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-teal-500 text-black'
                  : 'glass glass-hover text-zinc-400 hover:text-white'
              }`}
            >
              {cat.name}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                activeCategory === cat.id ? 'bg-black/20' : 'bg-white/10'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Endpoints */}
        <div className="space-y-4 animate-fade-in-up delay-300">
          {endpoints[activeCategory].map((endpoint, index) => (
            <div
              key={`${endpoint.method}-${endpoint.path}`}
              className="glass-card rounded-2xl overflow-hidden animate-stagger"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${methodColors[endpoint.method]}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-white font-mono">{endpoint.path}</code>
                </div>
                <p className="text-zinc-400 mb-4">{endpoint.description}</p>

                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">Parameters</h4>
                    <div className="bg-black/20 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left p-3 text-zinc-500 font-medium">Name</th>
                            <th className="text-left p-3 text-zinc-500 font-medium">Type</th>
                            <th className="text-left p-3 text-zinc-500 font-medium">Required</th>
                            <th className="text-left p-3 text-zinc-500 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {endpoint.parameters.map((param) => (
                            <tr key={param.name} className="border-b border-white/5 last:border-0">
                              <td className="p-3 font-mono text-teal-400">{param.name}</td>
                              <td className="p-3 text-purple-400">{param.type}</td>
                              <td className="p-3">
                                {param.required ? (
                                  <span className="text-amber-400">Required</span>
                                ) : (
                                  <span className="text-zinc-500">Optional</span>
                                )}
                              </td>
                              <td className="p-3 text-zinc-400">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">Response</h4>
                  <pre className="bg-black/40 rounded-lg p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
                    {endpoint.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default API;

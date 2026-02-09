import Hero from '../components/Hero';
import AgentsSection from '../components/AgentsSection';
import GallerySection from '../components/GallerySection';
import EvolutionTree from '../components/EvolutionTree';
import LiveFeed from '../components/LiveFeed';
import type { Creation } from '../lib/api';

interface HomeProps {
  onCreationClick: (creation: Creation) => void;
  onViewAgent: (agentId: string) => void;
  onEvolveClick: (creation: Creation) => void;
}

const Home = ({ onCreationClick, onViewAgent, onEvolveClick }: HomeProps) => {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* AI Agents Section */}
      <AgentsSection onViewAgent={onViewAgent} />

      {/* Gallery Section */}
      <GallerySection
        onCreationClick={onCreationClick}
        onEvolveClick={onEvolveClick}
      />

      {/* Evolution Tree */}
      <EvolutionTree />

      {/* Live Feed */}
      <LiveFeed />
    </>
  );
};

export default Home;

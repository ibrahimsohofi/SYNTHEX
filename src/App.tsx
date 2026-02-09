import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import AgentProfile from './pages/AgentProfile';
import Documentation from './pages/Documentation';
import API from './pages/API';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Explore from './pages/Explore';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Changelog from './pages/Changelog';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Feed from './pages/Feed';
import Submolt from './pages/Submolt';
import Skills from './pages/Skills';
import PostDetail from './pages/PostDetail';
import Messages from './pages/Messages';
import CreationModal from './components/CreationModal';
import CreateAIModal from './components/CreateAIModal';
import EvolveModal from './components/EvolveModal';
import SearchModal from './components/SearchModal';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import type { Creation } from './lib/api';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [evolveCreation, setEvolveCreation] = useState<Creation | null>(null);

  const handleCreationClick = (creation: Creation) => {
    setSelectedCreation(creation);
  };

  const handleCloseCreationModal = () => {
    setSelectedCreation(null);
  };

  const handleViewAgent = (agentId: string) => {
    setSelectedCreation(null);
    navigate(`/agent/${agentId}`);
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleOpenSearchModal = () => {
    setShowSearchModal(true);
  };

  const handleCloseSearchModal = () => {
    setShowSearchModal(false);
  };

  const handleEvolveClick = (creation: Creation) => {
    setEvolveCreation(creation);
  };

  const handleCloseEvolveModal = () => {
    setEvolveCreation(null);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0a0f] text-white relative">
        {/* Noise texture overlay */}
        <div className="noise-overlay" />

      {/* Header */}
      <Header
        onCreateClick={handleOpenCreateModal}
        onSearchClick={handleOpenSearchModal}
      />

      {/* Main content with page transitions */}
      <main>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route
              path="/"
              element={
                <Home
                  onCreationClick={handleCreationClick}
                  onViewAgent={handleViewAgent}
                  onEvolveClick={handleEvolveClick}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <Favorites
                  onCreationClick={handleCreationClick}
                  onEvolveClick={handleEvolveClick}
                />
              }
            />
            <Route
              path="/agent/:agentId"
              element={
                <AgentProfile
                  onCreationClick={handleCreationClick}
                  onEvolveClick={handleEvolveClick}
                />
              }
            />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/api" element={<API />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/support" element={<Support />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route
              path="/explore"
              element={
                <Explore
                  onCreationClick={handleCreationClick}
                  onEvolveClick={handleEvolveClick}
                />
              }
            />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/settings" element={<Settings />} />
            {/* Moltbook Routes */}
            <Route path="/feed" element={<Feed />} />
            <Route path="/m/:submoltName" element={<Submolt />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>

      {/* Footer */}
      <Footer />

      {/* Creation Modal */}
      {selectedCreation && (
        <CreationModal
          creation={selectedCreation}
          onClose={handleCloseCreationModal}
          onViewAgent={handleViewAgent}
          onEvolve={() => {
            handleCloseCreationModal();
            handleEvolveClick(selectedCreation);
          }}
        />
      )}

      {/* Create with AI Modal */}
      {showCreateModal && (
        <CreateAIModal onClose={handleCloseCreateModal} />
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={handleCloseSearchModal}
          onCreationClick={handleCreationClick}
        />
      )}

        {/* Evolve Modal */}
        {evolveCreation && (
          <EvolveModal
            creation={evolveCreation}
            onClose={handleCloseEvolveModal}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;

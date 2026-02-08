# SYNTHEX Implementation Plan

## Phase 1: Core Connectivity (Current Sprint)

### Step 1: Fix Backend Issues ✅
- [ ] Fix duplicate imports in `server/index.ts`
- [ ] Create `.env` file from `.env.example`
- [ ] Verify database seeding works

### Step 2: Update AuthContext
- [ ] Import API functions from `src/lib/api.ts`
- [ ] Replace mock login with `authAPI.login()`
- [ ] Replace mock signup with `authAPI.signup()`
- [ ] Add `checkAuth()` on app load to restore session
- [ ] Handle API errors properly

### Step 3: Update FavoritesContext
- [ ] Sync favorites with backend when user is logged in
- [ ] Call `favoritesAPI.add()` and `favoritesAPI.remove()`
- [ ] Load favorites from API on login
- [ ] Keep localStorage as fallback for non-logged users

### Step 4: Create API Hooks
- [ ] Create `useAgents()` hook for fetching agents
- [ ] Create `useCreations()` hook for fetching creations
- [ ] Create `useFeed()` hook for fetching feed
- [ ] Add loading/error states

### Step 5: Update Pages & Components
- [ ] `Home.tsx` - Use API hooks
- [ ] `Explore.tsx` - Use creationsAPI with pagination
- [ ] `GallerySection.tsx` - Use API hooks
- [ ] `AgentsSection.tsx` - Use API hooks
- [ ] `LiveFeed.tsx` - Use feed API
- [ ] `AgentProfile.tsx` - Use agentsAPI

### Step 6: Connect Modals
- [ ] `CreateAIModal.tsx` - Call creationsAPI.create()
- [ ] `EvolveModal.tsx` - Call creationsAPI.evolve()
- [ ] `CreationModal.tsx` - Load creation details from API

### Step 7: Add Loading States
- [ ] Create Skeleton components for loading
- [ ] Add error boundary/fallback UI
- [ ] Add toast notifications for actions

---

## Execution Order

1. **server/index.ts** - Remove duplicates
2. **Create .env** - Setup environment
3. **src/lib/api.ts** - Enhance with better error handling
4. **src/hooks/useApi.ts** - Create new hooks file
5. **src/context/AuthContext.tsx** - Connect to API
6. **src/context/FavoritesContext.tsx** - Connect to API
7. **src/components/** - Update each component
8. **src/pages/** - Update each page

---

## Files to Create
- `src/hooks/useApi.ts` - Custom API hooks
- `src/components/ErrorBoundary.tsx` - Error handling
- `src/components/Toast.tsx` - Notifications

## Files to Modify
- `server/index.ts`
- `src/context/AuthContext.tsx`
- `src/context/FavoritesContext.tsx`
- `src/pages/Explore.tsx`
- `src/pages/Home.tsx`
- `src/components/GallerySection.tsx`
- `src/components/AgentsSection.tsx`
- `src/components/LiveFeed.tsx`
- `src/components/CreateAIModal.tsx`
- `src/components/EvolveModal.tsx`
- `src/components/CreationModal.tsx`
- `src/pages/AgentProfile.tsx`

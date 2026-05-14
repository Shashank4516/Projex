import { Routes, Route, Outlet } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { MainMobileNav } from './components/MainMobileNav'
import { Dashboard } from './components/Dashboard'
import { ProjectCard911198 } from './components/ProjectCard911198'
import { AddProjectModal } from './components/AddProjectModal'
import {
  ProjectsProvider,
  useProjects,
} from './context/ProjectsContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationsProvider } from './context/NotificationsProvider'
import { LoginPage } from './pages/LoginPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { SignupPage } from './pages/SignupPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { PublicProfilePage } from './pages/PublicProfilePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProjectCardsSkeletonGrid } from './components/skeletons/ProjectCardsSkeletonGrid'
import { FILTER_NAV } from './data/filterNav'
import './App.css'

function MobileFilterBar() {
  const { activeFilter, setActiveFilter } = useProjects()
  return (
    <div className="mobile-filter" role="navigation" aria-label="Filter by technology">
      <ul className="mobile-filter__list">
        {FILTER_NAV.map((row) => {
          const isActive = row.id === 'all' ? activeFilter === null : activeFilter === row.label
          return (
            <li key={row.id} className="mobile-filter__item">
              <button
                type="button"
                className={['mobile-filter__btn', isActive ? 'mobile-filter__btn--active' : ''].filter(Boolean).join(' ')}
                onClick={() => setActiveFilter(row.id === 'all' ? null : row.label)}
                aria-pressed={isActive}
              >
                {row.src ? (
                  <img
                    className={['mobile-filter__icon', row.go ? 'mobile-filter__icon--go' : ''].filter(Boolean).join(' ')}
                    src={row.src}
                    alt=""
                  />
                ) : (
                  <span className="mobile-filter__icon mobile-filter__icon--all" aria-hidden="true">✦</span>
                )}
                <span className="mobile-filter__label">{row.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function AppLayout() {
  return (
    <div className="app">
      <Navbar />
      <AddProjectModal />
      <div className="app__shell">
        <Dashboard />
        <Outlet />
      </div>
      <MainMobileNav />
    </div>
  )
}

function ExplorePage() {
  const { filteredProjects, projectsLoading, projectsError, activeFilter } = useProjects()
  const showSkeleton = projectsLoading && !projectsError

  return (
    <main className="app__main" id="app-main" aria-label="Explore projects">
        <MobileFilterBar />
        <div className="app__explore-header">
          <h1 className="app__explore-title">
            {activeFilter ? activeFilter : 'Explore Projects'}
          </h1>
          {activeFilter && !showSkeleton ? (
            <p className="app__explore-count">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
            </p>
          ) : null}
        </div>

        {projectsError ? (
          <p className="app__projects-status app__projects-status--error" role="alert">
            {projectsError}. Start the API with{' '}
            <code className="app__inline-code">npm run dev</code> (runs Vite and
            the server).
          </p>
        ) : null}

        {!showSkeleton && !projectsError && filteredProjects.length === 0 && activeFilter ? (
          <div className="app__empty-filter">
            <p className="app__empty-filter-text">
              No projects found for <strong>{activeFilter}</strong>.
            </p>
            <p className="app__empty-filter-sub">
              Be the first to add one!
            </p>
          </div>
        ) : null}

        {showSkeleton ? (
          <ProjectCardsSkeletonGrid count={6} />
        ) : (
          <div className="project-cards">
            {filteredProjects.map((project) => (
              <div key={project.id} className="project-cards__slot">
                <ProjectCard911198 key={project.id} project={project} />
              </div>
            ))}
          </div>
        )}
      </main>
  )
}

function UploadPage() {
  const { setModalOpen } = useProjects()
  return (
    <main className="app__main app__simple" id="app-main" aria-label="Upload project">
      <h1 className="app__simple-title">Upload Project</h1>
      <p className="app__simple-text">
        Add a new project to the showcase. You can open the same form from the + control in the top bar.
      </p>
      <button type="button" className="app__simple-btn" onClick={() => setModalOpen(true)}>
        New project
      </button>
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <ProjectsProvider>
              <NotificationsProvider>
                <AppLayout />
              </NotificationsProvider>
            </ProjectsProvider>
          }
        >
          <Route index element={<ExplorePage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="user/:uid" element={<PublicProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

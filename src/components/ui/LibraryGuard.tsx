import { useNavigate, useLocation } from 'react-router-dom';

interface LocationState {
  inLibrary?: boolean;
  courseId?: number;
}

interface LibraryGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps a game page and shows an "Add to library" screen
 * if the course isn't in the user's library.
 *
 * Reads `inLibrary` and `courseId` from React Router's location state
 * (passed from CourseDetail → UnitDetail → game page).
 *
 * If state is missing (e.g. direct URL access), allows through by default.
 */
const LibraryGuard = ({ children }: LibraryGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as LocationState) || {};
  const inLibrary = routeState.inLibrary;
  const courseId = routeState.courseId;

  // If inLibrary is explicitly false, block access
  if (inLibrary === false) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-white dark:bg-background-dark">
        <div className="flex items-center p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center text-gray-900 dark:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-amber-500">lock</span>
            </div>
            <h2 className="text-gray-900 dark:text-white font-bold text-lg mb-2">
              Add Course to Library
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              To use Flashcards, Tests, and other learning activities, please add this course to your library first.
            </p>
            <div className="flex flex-col gap-3">
              {courseId && (
                <button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-medium"
                >
                  Go to Course
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // inLibrary is true or undefined (direct URL access) — allow through
  return <>{children}</>;
};

export default LibraryGuard;

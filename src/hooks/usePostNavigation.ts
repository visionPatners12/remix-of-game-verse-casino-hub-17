
import { useNavigate } from 'react-router-dom';

export function usePostNavigation() {
  const navigate = useNavigate();

  const navigateToPost = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return {
    navigateToPost,
    navigateBack,
    navigateToDashboard
  };
}

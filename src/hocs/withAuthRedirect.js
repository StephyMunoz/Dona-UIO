/**
 * Created by chalosalvador on 8/16/20
 */
import {useAuth} from '../lib/auth';
import Loading from '../components/Loading';
// import Routes from "../constants/Routes";
// import { useHistory } from "react-router-dom";

/**
 * Support client-side conditional redirecting based on the user's
 * authenticated state.
 *
 * @param WrappedComponent The component that this functionality
 * will be added to.
 * @param LoadingComponent The component that will be rendered while
 * the auth state is loading.
 * @param expectedAuth Whether the user should be authenticated for
 * the component to be rendered.
 * @param location The location to redirect to.
 */
export default function withAuthRedirect({
  WrappedComponent,
  LoadingComponent = Loading,
  expectedAuth,
  location,
}) {
  return props => {
    const {user} = useAuth();
    // const history = useHistory();

    if (user === null) {
      return <LoadingComponent />;
    }

    const isAuthenticated = !!user;
    const shouldRedirect = expectedAuth !== isAuthenticated;
    if (shouldRedirect) {
      // history.push(location || Routes.LOGIN); // todo set from location
      return null;
    }
    return <WrappedComponent {...props} />;
  };
}

/**
 * Created by chalosalvador on 8/16/20
 */
import withAuthRedirect from './withAuthRedirect';
import Navigation from '../navigation/Navigation';

/**
 * Require the user to be authenticated in order to render the component.
 * If the user isn't authenticated, forwconst navigation = useNavigation();ard to the given URL.
 */
export default function withAuth(
  WrappedComponent,
  location = Navigation.navigate('home'),
) {
  return withAuthRedirect({
    WrappedComponent,
    location,
    expectedAuth: true,
  });
}

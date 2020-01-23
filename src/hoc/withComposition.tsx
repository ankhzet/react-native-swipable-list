import hoistNonReactStatics from 'hoist-non-react-statics';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { withNavigationFocus, NavigationFocusInjectedProps } from 'react-navigation';

import { SwipeableListProps } from '../SwipeableList';

interface WithNavigation<T, K = any> extends SwipeableListProps<T, K>, Partial<NavigationFocusInjectedProps> {
  onRef?: React.Ref<InstanceType<any>>;
}

export const withComposition = (): any => {
  return <T, K, P extends WithNavigation<T, K>>(WrappedComponent: React.ComponentType<P>): React.ComponentType<P> => {
    class Wrapper extends React.Component<P & NavigationFocusInjectedProps> {
      render() {
        const { navigation, containerStyle, isFocused, ...rest } = this.props;
        const shouldForceOffscreen = (Platform.OS === 'android') && !isFocused;

        return (
          <WrappedComponent
            needsOffscreenAlphaCompositing={shouldForceOffscreen}
            containerStyle={[containerStyle, shouldForceOffscreen && styles.forceComposition]}
            {...rest as P}
          />
        );
      }
    }

    hoistNonReactStatics(Wrapper, WrappedComponent);

    return withNavigationFocus(Wrapper) as any;
  };
};

const styles = StyleSheet.create({
  forceComposition: {
    opacity: 0.99,
  },
});

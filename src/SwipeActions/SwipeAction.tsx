import { observer } from 'mobx-react';
import React from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
  LayoutRectangle,
} from 'react-native';

import { isSmallScreen } from '../util';
import { SwipeActionComponents } from './ActionDefinitions';

export interface ActionProps<A extends string> {
  action: A;
  text: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  underlayStyle?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export interface SwipeActionProps<A extends string> extends ActionProps<A> {
  onPress: (action: A) => void;
  animatedStyles: Record<SwipeActionComponents, StyleProp<ViewStyle>>;
  onMeasured: (action: A, layout: LayoutRectangle) => void;
}

@observer
export class SwipeAction<A extends string> extends React.Component<SwipeActionProps<A>> {
  onLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    if (layout.width && layout.height) {
      this.props.onMeasured(
        this.props.action,
        layout,
      );
    }
  };

  onPress = () => {
    this.props.onPress(
      this.props.action,
    );
  };

  render() {
    const {
      text, disabled, children,
      containerStyle, textStyle, wrapperStyle, underlayStyle,
      animatedStyles,
    } = this.props;

    return (
      <TouchableOpacity
        style={[styles.container, disabled && styles.disabled, animatedStyles.container, containerStyle]}
        disabled={disabled}
        onLayout={this.onLayout}
        onPress={this.onPress}
      >
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyles.underlay, underlayStyle]} />
        <Animated.View style={[wrapperStyle, animatedStyles.text]}>
          {children || (
            <Text style={[styles.text, textStyle]}>{text}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: isSmallScreen() ? 10 : 20,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'right',
    textAlignVertical: 'center',
    color: '#fff',
    fontSize: isSmallScreen() ? 10 : 12,
  },
});

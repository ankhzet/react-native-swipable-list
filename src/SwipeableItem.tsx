import autobind from 'autobind-decorator';
import React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Animated, LayoutChangeEvent, View } from 'react-native';

import { Animator, SwipeActionComponents } from './SwipeActions';

export interface SwipeableItemProps<A extends string> {
  animator: Animator<any, A, SwipeActionComponents>;
}

@observer
export class SwipeableItem<A extends string> extends React.Component<SwipeableItemProps<A>> {
  @observable isConfigured = false;

  @autobind
  onLayout({ nativeEvent: { layout: { width, height } } }: LayoutChangeEvent) {
    this.props.animator.mergeInterpolatorsConfig({
      width,
      height,
    });

    this.isConfigured = true;
  }

  render() {
    const wrapper = (
      <View key="child" onLayout={this.onLayout}>
        {this.props.children}
      </View>
    );

    if (!this.isConfigured) {
      return wrapper;
    }

    const { itemContainer } = this.props.animator.getInterpolatedStyles();

    return (
      <Animated.View style={itemContainer}>
        {wrapper}
      </Animated.View>
    );
  }
}

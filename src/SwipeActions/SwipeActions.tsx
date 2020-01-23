import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { StyleSheet, View, StyleProp, ViewStyle, LayoutRectangle } from 'react-native';

import { isRectangleSizeEqual } from '../util';
import { SwipeActionComponents } from './ActionDefinitions';
import { SwipeActionConfig } from './Animations';
import { Animator} from './Animator';
import { InterpolatorConfig } from './Interpolator';
import { SwipeAction, ActionProps} from './SwipeAction';

export interface SwipeActionsProps<T, A extends string, C extends SwipeActionConfig> {
  item: T;
  actions: ActionProps<A>[];
  animator: Animator<any, A, SwipeActionComponents>;
  animatorConfig?: Omit<C, keyof InterpolatorConfig> & Partial<Pick<C, keyof InterpolatorConfig>>;
  containerStyle?: StyleProp<ViewStyle>;
  onWidthMeasured?: (item: T, width: number) => void;
  onItemActionPress: (item: T, action: A) => void;
}

@observer
export class SwipeActions<T, A extends string, C extends SwipeActionConfig> extends React.Component<SwipeActionsProps<T, A, C>> {
  @observable sizes = observable.map();

  updateConfig(reference: A, rectangle: LayoutRectangle) {
    this.sizes.set(reference, rectangle);

    let total = 0;

    for (const { width } of this.sizes.values()) {
      total += width;
    }

    for (const { action } of this.props.actions) {
      if (reference === action) {
        this.props.animator.mergeInterpolatorConfig(action, {
          ...this.props.animatorConfig, //todo: move to cdm?
          total,
          width: rectangle.width,
          height: rectangle.height,
        });
      } else {
        this.props.animator.mergeInterpolatorConfig(action, {
          ...this.props.animatorConfig,
          total,
        });
      }
    }

    return total;
  }

  @action.bound
  onItemMeasured(action: A, rectangle: LayoutRectangle) {
    if (isRectangleSizeEqual(this.sizes.get(action), rectangle)) {
      return;
    }

    const total = this.updateConfig(action, rectangle);

    if (this.props.onWidthMeasured) {
      this.props.onWidthMeasured(
        this.props.item,
        total,
      );
    }
  }

  onPress = (action: A) => {
    this.props.onItemActionPress(
      this.props.item,
      action,
    );
  };

  render() {
    const { actions, containerStyle } = this.props;

    return (
      <View style={[styles.container, containerStyle]}>
        {actions.map((props) => (
          <SwipeAction<A>
            key={props.action}
            animatedStyles={this.props.animator.getInterpolatedStyle(props.action)}
            onMeasured={this.onItemMeasured}
            onPress={this.onPress}
            {...props}
          />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    paddingVertical: 2,
  },
});

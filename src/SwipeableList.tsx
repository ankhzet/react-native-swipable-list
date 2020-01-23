import React from 'react';
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';
import {
  StyleSheet,
  LayoutChangeEvent, LayoutRectangle,
  ListRenderItemInfo,
  StyleProp, ViewStyle,
  View,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';

export interface SwipeableListProps<T, K = any> extends Partial<Omit<SwipeListView<T>['props'], 'onSwipeValueChange'>> {
  activeWidth: number;
  getItemByKey: (key: K) => T|undefined;
  renderItemActions: (info: ListRenderItemInfo<T>) => JSX.Element;
  actionsContainerStyle?: StyleProp<ViewStyle>;
  onSwipeValueChange: (item: T, value: number) => void;
  onShouldUpdate?: (layout: LayoutRectangle) => void|undefined|false|true;
  needsOffscreenAlphaCompositing?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

@observer
export class SwipeableList<T> extends React.Component<SwipeableListProps<T>> {
  @observable guid = 0;
  @observable disablePreview = false;

  @computed get extraData() {
    return this.guid;
  }

  @computed get previewRowKey() {
    return this.disablePreview ? undefined : this.props.previewRowKey;
  }

  private itemKey = (item: any) => {
    return item._id || item.key;
  };

  private onLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    if (this.props.onShouldUpdate && this.props.onShouldUpdate(layout)) {
      this.guid++;
    }
  };

  onSwipeValueChange = ({ key, value }: { key: string, value: number }) => {
    const item = this.props.getItemByKey(key);

    if (item) {
      if (!this.disablePreview) {
        this.disablePreview = true;
      }

      this.props.onSwipeValueChange(item, value);
    }
  };

  renderList() {
    const {
      activeWidth,
      getItemByKey,
      renderItemActions,
      actionsContainerStyle,
      onSwipeValueChange,
      onShouldUpdate,
      previewRowKey,
      ...rest
    } = this.props;

    return (
      // @ts-ignore
      <SwipeListView<T>
        useFlatList={true}
        recalculateHiddenLayout={true}
        // @ts-ignore
        useNativeDriver={true}
        disableRightSwipe={true}
        swipeToOpenVelocityContribution={0}
        rightOpenValue={-this.props.activeWidth}
        previewOpenValue={-this.props.activeWidth}
        previewOpenDelay={1500}

        keyExtractor={this.itemKey}
        renderHiddenItem={this.props.renderItemActions}
        onSwipeValueChange={this.onSwipeValueChange}
        extraData={this.extraData}
        previewRowKey={this.previewRowKey}

        {...rest}
      />
    );
  }

  render() {
    return (
      <View
        needsOffscreenAlphaCompositing={this.props.needsOffscreenAlphaCompositing}
        style={[styles.flex, this.props.containerStyle]}
        onLayout={this.onLayout}
      >
        {this.renderList()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

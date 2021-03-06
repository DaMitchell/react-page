import throttle from 'lodash.throttle';
import * as React from 'react';
import { DropTargetConnector, DropTargetMonitor } from 'react-dnd';
import {
  createNativeCellReplacement,
  isNativeHTMLElementDrag,
} from '../../../helper/nativeDragHelpers';
import { delay } from '../../../helper/throttle';
import {
  computeAndDispatchHover,
  computeAndDispatchInsert,
} from '../../../service/hover/input';
import logger from '../../../service/logger';
import { ComponetizedCell, ComponetizedRow } from '../../../types/editable';
let last: { hover: string; drag: string } = {
  hover: '',
  drag: '',
};

const clear = (hover: ComponetizedRow, drag: string) => {
  if (hover.id === last.hover && drag === last.drag) {
    return;
  }
  last = { hover: hover.id, drag };
  hover.clearHover(drag);
};

export const target = {
  hover: throttle(
    (
      hover: ComponetizedRow,
      monitor: DropTargetMonitor,
      component: React.ReactInstance
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let drag: any = monitor.getItem();
      if (!drag) {
        // item undefined, happens when throttle triggers after drop
        return;
      }

      if (isNativeHTMLElementDrag(monitor)) {
        drag = createNativeCellReplacement();
      }

      if (!drag) {
        return;
      } else if (drag.id === hover.id) {
        clear(hover, drag.id);
        return;
      } else if (!monitor.isOver({ shallow: true })) {
        return;
      } else if (hover.ancestors.indexOf(drag.id) > -1) {
        // If hovering over a child of itself
        clear(hover, drag.id);
        return;
      } else if (!hover.id) {
        // If hovering over something that isn't a cell or hasn't an id, do nothing. Should be an edge case
        logger.warn(
          'Canceled cell.drop.target.hover: no id given.',
          hover,
          drag
        );
        return;
      }

      computeAndDispatchHover(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hover as any,
        drag,
        monitor,
        component,
        '10x10-no-inline'
      );
    },
    delay,
    { leading: false }
  ),

  canDrop: ({ id, ancestors }: ComponetizedRow, monitor: DropTargetMonitor) => {
    const item = monitor.getItem();
    return item.id !== id || ancestors.indexOf(item.id) === -1;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drop(hover: ComponetizedRow, monitor: DropTargetMonitor, component: any) {
    let drag: ComponetizedCell = monitor.getItem();

    if (isNativeHTMLElementDrag(monitor)) {
      const { plugins } = component.props.config;
      drag = plugins.createNativePlugin(hover, monitor, component);
    }

    if (monitor.didDrop() || !monitor.isOver({ shallow: true })) {
      // If the item drop occurred deeper down the tree, don't do anything
      return;
    } else if (hover.ancestors.indexOf(drag.id) > -1) {
      // If hovering over a child of itself
      hover.cancelCellDrag(drag.id);
      return;
    } else if (drag.id === hover.id) {
      hover.cancelCellDrag(drag.id);
      return;
    }

    computeAndDispatchInsert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hover as any,
      drag,
      monitor,
      component,
      '10x10-no-inline'
    );
  },
};

export const connect = (
  _connect: DropTargetConnector,
  monitor: DropTargetMonitor
) => ({
  connectDropTarget: _connect.dropTarget(),
  isOverCurrent: monitor.isOver({ shallow: true }),
});

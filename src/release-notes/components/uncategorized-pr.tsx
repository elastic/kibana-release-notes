import { memo, useCallback, useMemo, useState } from 'react';
import type { FC } from 'react';
import cloneDeep from 'lodash.clonedeep';
import {
  EuiSplitPanel,
  EuiBadge,
  EuiBadgeGroup,
  EuiTextColor,
  EuiPopover,
  EuiSelectable,
  EuiPopoverTitle,
  EuiIcon,
  EuiSelectableOption,
} from '@elastic/eui';
import { PrItem, Pr, Label } from '../../common';
import { setConfig, useConfig } from '../../config';

interface UncategorizedPrProps {
  pr: PrItem;
}

const LabelBadge: FC<{ label: Label }> = memo(({ label }) => {
  const config = useConfig();
  const [isPopoverVisible, setPopoverVisible] = useState(false);

  const areaTitles = useMemo(
    () =>
      config.areas
        .map(({ title, options }) => ({
          label: title,
          append: options?.textOverwriteTemplate ? (
            <EuiIcon type="visText" color="subdued" />
          ) : undefined,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [config.areas]
  );

  const onLabelSelected = useCallback(
    (selectedOptions: EuiSelectableOption[]) => {
      const newConfig = cloneDeep(config);
      const option = selectedOptions.find((option) => option.checked === 'on');
      const area = newConfig.areas.find((area) => area.title === option?.label);
      if (area) {
        area.labels = [...(area.labels || []), label.name];
        setPopoverVisible(false);
        setConfig(newConfig);
      }
    },
    [config, label.name]
  );

  return (
    <EuiPopover
      isOpen={isPopoverVisible}
      closePopover={() => setPopoverVisible(false)}
      panelPaddingSize="none"
      button={
        <EuiBadge
          color={`#${label.color}`}
          onClick={() => setPopoverVisible(!isPopoverVisible)}
          onClickAriaLabel="Assign label to area"
        >
          {label.name}
        </EuiBadge>
      }
    >
      <EuiSelectable
        options={areaTitles}
        searchable
        searchProps={{ compressed: true }}
        singleSelection={true}
        onChange={onLabelSelected}
      >
        {(list, search) => (
          <div style={{ width: 240 }}>
            <EuiPopoverTitle paddingSize="s">{search}</EuiPopoverTitle>
            {list}
          </div>
        )}
      </EuiSelectable>
    </EuiPopover>
  );
});

export const UncategorizedPr: FC<UncategorizedPrProps> = memo(({ pr }) => {
  // We only want to show non version non release_note labels in the UI
  const filteredLables = useMemo(
    () =>
      pr.labels.filter(
        ({ name }) => !name.startsWith('release_note:') && !name.match(/^v\d+\.\d+\.\d+$/)
      ),
    [pr.labels]
  );
  return (
    <EuiSplitPanel.Outer>
      <EuiSplitPanel.Inner paddingSize="s">
        <Pr pr={pr} showAuthor={true} />
      </EuiSplitPanel.Inner>
      <EuiSplitPanel.Inner paddingSize="s" color="subdued">
        {filteredLables.length > 0 && (
          <EuiBadgeGroup>
            {filteredLables.map((label) => (
              <LabelBadge key={label.node_id} label={label} />
            ))}
          </EuiBadgeGroup>
        )}
        {filteredLables.length === 0 && <EuiTextColor color="subdued">No labels</EuiTextColor>}
      </EuiSplitPanel.Inner>
    </EuiSplitPanel.Outer>
  );
});

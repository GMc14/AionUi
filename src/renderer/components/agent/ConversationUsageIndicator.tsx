/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Popover, Tag } from '@arco-design/web-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { TChatConversation } from '@/common/config/storage';
import { formatTokenCount } from '@/renderer/components/agent/ContextUsageIndicator';
import { DEFAULT_CONTEXT_LIMIT } from '@/renderer/utils/model/modelContextLimits';

interface ConversationUsageIndicatorProps {
  conversation: TChatConversation | undefined;
  className?: string;
}

const ConversationUsageIndicator: React.FC<ConversationUsageIndicatorProps> = ({
  conversation,
  className = '',
}) => {
  const { t } = useTranslation();

  const { usageData, limit, percentage, displayUsage, displayLimit } = useMemo(() => {
    const extra = conversation?.extra as
      | {
          lastTokenUsage?: { totalTokens: number };
          lastContextLimit?: number;
        }
      | undefined;

    const usage = extra?.lastTokenUsage;
    const ctxLimit = extra?.lastContextLimit ?? DEFAULT_CONTEXT_LIMIT;
    const tokens = usage?.totalTokens ?? 0;
    const pct = ctxLimit > 0 ? (tokens / ctxLimit) * 100 : 0;

    return {
      usageData: usage,
      limit: ctxLimit,
      percentage: pct,
      displayUsage: formatTokenCount(tokens),
      displayLimit: formatTokenCount(ctxLimit, true),
    };
  }, [conversation?.extra]);

  // No usage data recorded yet
  if (!usageData) {
    // Optional: show as grayed out or not render
    return (
      <Tag color='gray' size='small' className={className}>
        {t('conversation.usage.noUsage', 'No usage')}
      </Tag>
    );
  }

  // Determine color based on percentage
  const getTagColor = () => {
    if (percentage > 90) return 'red';
    if (percentage > 70) return 'orange';
    return 'green';
  };

  const popoverContent = (
    <div className='p-8px min-w-160px'>
      <div className='text-14px font-medium text-t-primary'>
        {t('conversation.usage.tokens', 'Tokens')}: {displayUsage} / {displayLimit}
      </div>
      <div className='text-12px text-t-secondary mt-4px'>
        {percentage.toFixed(1)}% {t('conversation.usage.ofContext', 'of context')}
      </div>
    </div>
  );

  return (
    <Popover content={popoverContent} position='top' trigger='hover'>
      <Tag color={getTagColor()} size='small' className={className}>
        {displayUsage}
      </Tag>
    </Popover>
  );
};

export default ConversationUsageIndicator;
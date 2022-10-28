import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

const LANGUAGE_LABEL_MAP = {
  curl: 'cURL',
  javascript: 'JavaScript / TypeScript'
};

const TabbedCodeBlock = props => {
  const { children } = props;

  const codeBlocks = children.map(c => {
    const codeProps = c.props.children.props;

    return {
      language: codeProps.className.replace('language-', ''),
      code: codeProps.children
    };
  });

  return (
    <Tabs groupId="tabbed-code-block">
      {codeBlocks.map(block => (
        <TabItem value={block.language} label={LANGUAGE_LABEL_MAP[block.language]}>
          <CodeBlock language={block.language}>{block.code}</CodeBlock>
        </TabItem>
      ))}
    </Tabs>
  );
};

export default TabbedCodeBlock;

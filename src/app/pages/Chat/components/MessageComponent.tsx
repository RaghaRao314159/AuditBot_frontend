import React from 'react';
import { Avatar, Badge } from '@mantine/core';
import { Prism } from '@mantine/prism';
import styled from 'styled-components/macro';
import { useSelector } from 'react-redux';
import { getCharacter } from '../slice/selectors';
import {
  characterOptions,
  characterOptionsWithEmojis,
} from 'app/api/characters';
import { Actions } from './Actions';
import { useMediaQuery } from 'react-responsive';

import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import './tableStyle.css';

interface MessageComponentProps {
  role?: string;
  message: string | React.ReactNode;
  visible?: boolean;
  customName?: string;
  useCustomName?: boolean;
  avatar?: string;
  loader?: boolean;
  messageIdx?: number;
}


interface ExtractedMarkdown {
    beforeTable: string;
    table: string | null;
    afterTable: string;
}

const extractMarkdownTable = (markdownString: string): ExtractedMarkdown => {
    // Find the index of the first and last pipe '|' characters
    const firstPipeIndex = markdownString.indexOf('|');
    const lastPipeIndex = markdownString.lastIndexOf('|');

    // If there are no pipes, it means there's no table in the string
    if (firstPipeIndex === -1 || lastPipeIndex === -1) {
        return {
            beforeTable: markdownString,
            table: null,
            afterTable: ''
        };
    }

    // Find the start of the line where the first pipe occurs and the end of the line with the last pipe
    const tableStartIndex = markdownString.lastIndexOf('\n', firstPipeIndex) + 1;
    const tableEndIndex = markdownString.indexOf('\n', lastPipeIndex) === -1 
        ? markdownString.length 
        : markdownString.indexOf('\n', lastPipeIndex);

    // Extract the text before the table, the table itself, and the text after the table
    const beforeTable = markdownString.slice(0, tableStartIndex).trim();
    const table = markdownString.slice(tableStartIndex, tableEndIndex).trim();
    const afterTable = markdownString.slice(tableEndIndex).trim();

    return {
        beforeTable,
        table,
        afterTable
    };
};


const extractMarkdownTable2 = (markdownString: string): string | null => {
    // Find the index of the first and last pipe '|' characters
    const firstPipeIndex = markdownString.indexOf('|');
    const lastPipeIndex = markdownString.lastIndexOf('|');

    // If there are no pipes, it means there's no table in the string
    if (firstPipeIndex === -1 || lastPipeIndex === -1) {
        return null;
    }

    // Extract the substring between the first and last pipe, and include all lines in between
    const tableString = markdownString.slice(firstPipeIndex, lastPipeIndex + 1);

    // Find the start of the line where the first pipe occurs and the end of the line with the last pipe
    const tableStartIndex = markdownString.lastIndexOf('\n', firstPipeIndex) + 1;
    const tableEndIndex = markdownString.indexOf('\n', lastPipeIndex) === -1 
        ? markdownString.length 
        : markdownString.indexOf('\n', lastPipeIndex);

    return markdownString.slice(tableStartIndex, tableEndIndex).trim();
};





export const MessageComponent = ({
  role = 'user',
  message,
  visible = true,
  customName,
  useCustomName = false,
  avatar,
  loader = false,
  messageIdx,
}: MessageComponentProps) => {
  const avatarProps = {
    src: null,
    alt: 'no image here',
    size: 'md',
    color: 'indigo',
  };

  const characterSelected = useSelector(getCharacter);
  const [showActions, setShowActions] = React.useState(false);

  const detectFormatting = (message: string | React.ReactNode) => {
    if (typeof message !== 'string') {
      return message;
    }

    const codeRegex = /```(?:\w+)?\s*([\s\S]*?)```/g;
    // const codeRegex = /```(?:\w+)?\s*([\s\S]*?)```|([\|]+)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const extractedTableMessage = extractMarkdownTable(message);
    const tableMessage = extractedTableMessage.table;
    const beforeTableMessage = extractedTableMessage.beforeTable;
    const afterTableMessage = extractedTableMessage.afterTable;

    if ((message.indexOf('```') === -1) && (tableMessage !== null)){
        // Split the text before the code block by newline characters and wrap each line in a <p> element
        const textLines = beforeTableMessage.split('\n').map((line, index) => (
          <InnerText key={index}>
            <ReactMarkdown
              components={{
                h1: 'h2',
                h2: 'h3',
              }}
            >
              {line}
            </ReactMarkdown>
          </InnerText>
        ));
        // Add the wrapped lines to the parts array
        parts.push(...textLines);

        parts.push(
            <TableWrapper className='table-container'>
                <ReactMarkdown children={tableMessage} remarkPlugins={[remarkGfm]} />
            </TableWrapper>
        )


        // Split the remaining text by newline characters and wrap each line in a <p> element
        const remainingLines = afterTableMessage.split('\n').map((line, index) => (
            <InnerText key={index}>
            <ReactMarkdown
                components={{
                h1: 'h2',
                h2: 'h3',
                }}
            >
                {line}
            </ReactMarkdown>
            </InnerText>
        ));
        // Add the wrapped lines to the parts array
        parts.push(...remainingLines);
    }

    else {
        while ((match = codeRegex.exec(message)) !== null) {
            // Add the part of the message before the matched code
            if (match.index > lastIndex) {
                const textBeforeCode = message.slice(lastIndex, match.index);
                // Split the text before the code block by newline characters and wrap each line in a <p> element
                const textLines = textBeforeCode.split('\n').map((line, index) => (
                <InnerText key={index}>
                    <ReactMarkdown
                    components={{
                        h1: 'h2',
                        h2: 'h3',
                    }}
                    >
                    {line}
                    </ReactMarkdown>
                </InnerText>
                ));
                // Add the wrapped lines to the parts array
                parts.push(...textLines);
            }

            // Add the <Code> component with the wrapped lines
            parts.push(
                <CodeWrapper>
                <Prism
                    className="prism"
                    withLineNumbers
                    language="tsx"
                    key={match.index}
                >
                    {match[1]}
                </Prism>
                </CodeWrapper>,
            );
            if (tableMessage !== null) {
                parts.push(
                    <div className='table-container'>
                        <ReactMarkdown children={tableMessage} remarkPlugins={[remarkGfm]} />
                    </div>
                )
            }
                
            lastIndex = codeRegex.lastIndex;
        }

        // Add the remaining part of the message
        if (lastIndex < message.length) {
        const remainingText = message.slice(lastIndex);
        // Split the remaining text by newline characters and wrap each line in a <p> element
        const remainingLines = remainingText.split('\n').map((line, index) => (
            <InnerText key={index}>
            <ReactMarkdown
                components={{
                h1: 'h2',
                h2: 'h3',
                }}
            >
                {line}
            </ReactMarkdown>
            </InnerText>
        ));
        // Add the wrapped lines to the parts array
        parts.push(...remainingLines);
        }
    }

    // Return the parts as an array of React elements
    return parts;
  };

  const generateAvatarText = (role: string) => {
    if (role === 'user') return 'ME';

    if (characterSelected === characterOptions[0]) return 'AI';

    return characterOptionsWithEmojis[characterSelected] || 'AI';
  };

  const isMobile = useMediaQuery({ query: '(max-width: 1024px)' });

  return (
    <Message
      style={{
        justifyContent: role === 'assistant' ? 'flex-start' : 'flex-end',
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        height: visible ? (loader ? '30px' : 'auto') : 0,
        margin: visible ? '15px 0' : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      <Avatar
        {...avatarProps}
        color={role === 'assistant' ? 'red' : 'indigo'}
        style={{
          order: role === 'assistant' ? 0 : 1,
          width: '44px',
          height: '44px',
          minWidth: '44px',
          marginLeft: '3px',
          marginTop: 0,
        }}
        src={role === 'assistant' ? avatar : null}
        radius="0.5rem"
      >
        {generateAvatarText(role)}
      </Avatar>

      <BubbleWrap>
        {role === 'assistant' && customName && (
          <Badge
            size={isMobile ? 'xs' : 'sm'}
            color="red"
            className="custom-name"
          >
            {customName}
          </Badge>
        )}
        <MessageBar
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <Text order={role === 'assistant' ? 0 : 1} isMobile={isMobile}>
            {detectFormatting(message)}
          </Text>
          <Actions
            showButtons={showActions}
            messageIdx={messageIdx}
            copyValue={message as string}
          />
        </MessageBar>
      </BubbleWrap>
    </Message>
  );
};

const BubbleWrap = styled.div`
  position: relative;

  .custom-name {
    margin-left: 10px;
    margin-bottom: 5px;
  }
`;

const MessageBar = styled.div`
  display: flex;
  align-items: center;
  overflow-x: hidden;
`;

const Message = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;
`;

const Text = styled.p<any>`
  margin: 0 10px;
  color: ${props => (props.order === 0) ? props.theme.textAI : props.theme.textUser};
  background-color: ${props => (props.order === 0) ? props.theme.chatBubbleSystemAI : props.theme.chatBubbleSystemUser};
  padding: 10px;
  font-size: 1rem;
  border-radius: 0.5rem;
  width: 96%;
  order: ${props => props.order};

  pre {
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
    text-overflow: ellipsis;

    white-space: normal;
  }

  .prism {
    max-width: ${props => (props.isMobile ? '80vw' : 'unset')};
    overflow-x: auto;

    pre {
      white-space: pre-wrap;
    }
  }
`;

const InnerText = styled.p`
  padding: 0;
  margin: 0;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }

  p {
    margin: 0;
    padding: 0;
  }
`;

const CodeWrapper = styled.div`
  padding: 10px 0;
  overflow-x: auto;
  opacity: 100%;

  pre {
    padding-right: 30px;
    background-color: ${props => props.theme.codeBackground} !important;
  }
`;


const TableWrapper = styled.div`
    color: ${props => props.theme.tableHeaderText};
    background-color: ${props => props.theme.tableBackground};

    th {
        background-color: ${props => props.theme.tableHeaderBackground};
    }

    th:hover {
        background-color: ${props => props.theme.tableHeaderBackgroundHover};
    }

    td:hover {
        background-color: ${props => props.theme.tableCellBackgroundHover};
    }
`;



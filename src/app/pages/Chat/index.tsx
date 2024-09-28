import * as React from 'react';
import styled from 'styled-components/macro';
import { NavBar } from 'app/components/NavBar';
import { Helmet } from 'react-helmet-async';
import { StyleConstants } from 'styles/StyleConstants';
import { Textbox } from './Textbox';
import { LeftSidebar } from './components/LeftSidebar';
import { useMediaQuery } from 'react-responsive';
import EditModal from 'app/components/Modal/EditModal';
import PromptModal from 'app/components/Modal/PromptModal';

export function ChatPage() {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1024px)' });

  return (
    <>
      <EditModal />
      <PromptModal />
      <NavBar />
      <Body>
        {!isTabletOrMobile && <LeftSidebar />}
        <Wrapper isMobile={isTabletOrMobile}>
          <Title>🧨 AuditBot</Title>
          <Textbox />
        </Wrapper>
      </Body>
    </>
  );
}

const Body = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
`;

const Wrapper = styled.div<any>`
  height: calc(100vh - ${StyleConstants.NAV_BAR_HEIGHT});
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 0;
  padding-top: ${props => props.isMobile && '0'};
  position: relative;
  width: ${props => props.isMobile && '100%'};
`;

const Title = styled.div`
  position: absolute;
  top: 35vh;
  z-index: 1;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
  font-weight: bold;
  color: ${p => p.theme.text};
  opacity: 0.2;
  font-size: 2.375rem;
  user-select: none;

  span {
    font-size: 2.125rem;
  }
`;

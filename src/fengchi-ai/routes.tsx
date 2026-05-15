import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';

const FengchiAIRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="chat" element={<Chat />} />
    </Routes>
  );
};

export default FengchiAIRoutes;

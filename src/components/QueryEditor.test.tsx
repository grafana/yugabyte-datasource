import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryEditor } from './QueryEditor';
import { YugabyteQuery } from 'types';
import { DataSource } from 'datasource';

describe('QueryEditor', () => {
  it('should render without errors', async () => {
    const MOCK_PROPS = generateMockProps();
    render(<QueryEditor {...MOCK_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});

interface MockProps {
  datasource: DataSource;
  query: YugabyteQuery;
  onRunQuery: () => void;
  onChange: () => void;
}

const generateMockProps = (): MockProps => {
  return {
    datasource: {} as DataSource,
    query: {} as YugabyteQuery,
    onRunQuery: jest.fn(),
    onChange: jest.fn(),
  };
};

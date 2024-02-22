import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { ConfigEditor } from './ConfigEditor';
import { DataSourceSettings } from '@grafana/data';
import { YugabyteOptions } from 'types';

describe('ConfigEditor', () => {
  it('should render without errors', () => {
    const MOCK_PROPS = generateMockProps();
    render(<ConfigEditor {...MOCK_PROPS} />);
    expect(screen.getByPlaceholderText('localhost:5433')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('yb_demo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('yugabyte')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument();
  });

  it('should update the host url', () => {
    const MOCK_PROPS = generateMockProps();
    render(<ConfigEditor {...MOCK_PROPS} />);
    const input = screen.getByPlaceholderText('localhost:5433');
    fireEvent.change(input, { target: { value: 'new_host' } });
    expect(MOCK_PROPS.onOptionsChange).toHaveBeenCalledWith(expect.objectContaining({ url: 'new_host' }));
  });

  it('should update the database', () => {
    const MOCK_PROPS = generateMockProps();
    render(<ConfigEditor {...MOCK_PROPS} />);
    const input = screen.getByPlaceholderText('yb_demo');
    fireEvent.change(input, { target: { value: 'new_database' } });
    expect(MOCK_PROPS.onOptionsChange).toHaveBeenCalledWith(
      expect.objectContaining({ jsonData: { database: 'new_database' } })
    );
  });

  it('should update the username', () => {
    const MOCK_PROPS = generateMockProps();
    render(<ConfigEditor {...MOCK_PROPS} />);
    const input = screen.getByPlaceholderText('yugabyte');
    fireEvent.change(input, { target: { value: 'new_username' } });
    expect(MOCK_PROPS.onOptionsChange).toHaveBeenCalledWith(expect.objectContaining({ user: 'new_username' }));
  });

  it('should update the password', () => {
    const MOCK_PROPS = generateMockProps();
    render(<ConfigEditor {...MOCK_PROPS} />);
    const input = screen.getByPlaceholderText('********');
    fireEvent.change(input, { target: { value: 'new_password' } });
    fireEvent.blur(input);
    expect(MOCK_PROPS.onOptionsChange).toHaveBeenCalledWith(
      expect.objectContaining({ secureJsonData: { password: 'new_password' } })
    );
  });
});

interface MockProps {
  options: DataSourceSettings<YugabyteOptions, {}>;
  onOptionsChange: () => void;
}

const generateMockProps = (): MockProps => {
  return {
    options: {
      url: '',
      user: '',
      jsonData: {},
      secureJsonData: {},
    } as DataSourceSettings<YugabyteOptions, {}>,
    onOptionsChange: jest.fn(),
  };
};

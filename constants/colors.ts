export const Colors = {
  light: {
    background: '#fff',
    text: '#000',
    border: '#000',
    card: '#fff',
    tabBar: '#fff',
    statusBar: '#fff',
    input: '#fff',
    inputPlaceholder: '#666',
    button: '#fff',
    buttonText: '#000',
    loader: '#000',
  },
  dark: {
    background: '#000',
    text: '#fff',
    border: '#fff',
    card: '#1a1a1a',
    tabBar: '#1a1a1a',
    statusBar: '#1a1a1a',
    input: '#1a1a1a',
    inputPlaceholder: '#999',
    button: '#1a1a1a',
    buttonText: '#fff',
    loader: '#fff',
  },
};

export type ColorScheme = typeof Colors.light;

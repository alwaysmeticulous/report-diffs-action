import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/App.jsx';
import { loadAndStartRecorder } from '@alwaysmeticulous/recorder-loader';

async function startApp() {
	try {
		await loadAndStartRecorder({
			projectId: 'CuQi4sDOznYdYaIpgjBl5qbi8XfsXLSehKiM91dF',
		});
	} catch (err) {
		console.error(`Meticulous failed to initialise ${err}`);
	}

	// Initalise app after the Meticulous recorder is ready, e.g.
	ReactDOM.render(<App />, document.getElementById('root'));
}

startApp();

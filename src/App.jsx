import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="card max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary-500 mb-4">
            FlowOps
          </h1>
          <p className="text-xl text-neutral-300 mb-6">
            IT Operations and Workflow Automation Platform
          </p>
          <div className="flex gap-4 justify-center">
            <button className="btn btn-primary">
              Početna
            </button>
            <button className="btn btn-outline">
              Saznaj više
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import React from 'react';

const SimpleHeroForm: React.FC = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    console.log('🎯 SimpleHeroForm mounted successfully!');
    setIsLoaded(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Simple form submitted!');
    alert('Simple form test - this works!');
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '2rem', 
      borderRadius: '12px', 
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      width: '100%'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#333' }}>
        {isLoaded ? '✅ Form Loaded Successfully!' : '⏳ Loading...'}
      </h2>
      
      {isLoaded && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              placeholder="Paste your project details here..."
              rows={6}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              required
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Your Name *"
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
            <input
              type="email"
              placeholder="Email Address *"
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #0052cc 0%, #003d99 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Test Form Submission
          </button>
        </form>
      )}
      
      <p style={{ 
        fontSize: '12px', 
        color: '#666', 
        marginTop: '1rem', 
        textAlign: 'center' 
      }}>
        🔧 This is a simple test form to verify React components are loading
      </p>
    </div>
  );
};

export default SimpleHeroForm;
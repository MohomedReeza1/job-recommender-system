import React, { useEffect, useState } from "react";

const LocalStorageDebugger = () => {
  const [storageItems, setStorageItems] = useState({});
  
  useEffect(() => {
    // Update values every second
    const interval = setInterval(() => {
      const items = {
        token: localStorage.getItem("token") ? "[present]" : "[missing]",
        role: localStorage.getItem("role"),
        user_id: localStorage.getItem("user_id"),
        specific_id: localStorage.getItem("specific_id"),
      };
      setStorageItems(items);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const style = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    padding: '10px',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    zIndex: 9999,
    borderRadius: '5px',
    fontSize: '12px',
    fontFamily: 'monospace'
  };
  
  return (
    <div style={style}>
      <h4 style={{margin: '0 0 5px 0'}}>LocalStorage:</h4>
      <pre>{JSON.stringify(storageItems, null, 2)}</pre>
    </div>
  );
};

export default LocalStorageDebugger;
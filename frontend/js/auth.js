async function loginUser(username, password) {
    const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    
    if (response.ok) {
        localStorage.setItem('userApiKey', data.apiKey);
        localStorage.setItem('userRole', data.role);
        
        // Arahkan berdasarkan role
        if (data.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    } else {
        alert(data.message);
    }
}

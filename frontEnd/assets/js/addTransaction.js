const API_URL = '/api/transactions';
let AUTH_TOKEN = localStorage.getItem('token') || '';

function saveToken() {
    AUTH_TOKEN = document.getElementById('token').value;
    localStorage.setItem('token', AUTH_TOKEN);
    alert('Token saved!');
}

async function fetchData() {
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    });
    const result = await response.json();
    const display = document.getElementById('display-area');
    display.innerHTML = '';

    if (result.data && result.data.transactions) {
        result.data.transactions.forEach(t => {
            const div = document.createElement('div');
            div.className = `item ${t.type}`;
            div.innerHTML = `<strong>${t.type}:</strong> $${t.amount} - ${t.description || 'No description'}`;
            display.appendChild(div);
        });
    } else {
        display.innerHTML = '<p>No transactions found.</p>';
    }
}

// Handle Transaction Form
document.getElementById('transaction-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        amount: document.getElementById('trans-amount').value,
        type: document.getElementById('trans-type').value,
        description: document.getElementById('trans-desc').value,
        date: new Date()
    };

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}` 
        },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert('Transaction added!');
        fetchData();
    } else {
        alert('Error adding transaction');
    }
};

// Initial load
if (AUTH_TOKEN) fetchData();
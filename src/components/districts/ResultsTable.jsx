

function TableWrapper(rows) {
    let guts = `
        <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">#</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Address</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">House</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Senate</th>
            </tr>
        </thead>
        <tbody>
            ${rows.join('')}
        </tbody>
        </table>
    `;

    let table = document.createElement('table');
    table.style.borderCollapse = 'collapse';

    table.innerHTML = guts;
    return table; // Return the DOM element for the table
}

// Build table HTML ordered by input (one row per address)
export default function ResultsTable(addresses) {
    const rows = addresses.map((addr, i) => `
        <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">${i + 1}</td>
            <td class="addresses-cell" style="border: 1px solid #ccc; padding: 8px; cursor: pointer;">
                <a data-house="${addr.house}" data-senate="${addr.senate}" data-lat="${addr.location.lat()}" data-lng="${addr.location.lng()}">${addr.address}</a>
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
                ${addr.house ? `<div>District ${addr.house}</div>` : ''}
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
                ${addr.senate ? `<div>District ${addr.senate}</div>` : ''}
            </td>
        </tr>
    `);

    return TableWrapper(rows);
}

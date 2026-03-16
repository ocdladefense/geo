function tableWrapper(rows) {
    return `
        <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">#</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Addressees</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">District</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
        </table>
    `;
}

// Build table HTML ordered by input (one row per address)
export function buildTableByAddress(addresses) {
    const rows = addresses.map((addr, i) => `
        <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">${i + 1}</td>
            <td class="addresses-cell" style="border: 1px solid #ccc; padding: 8px; cursor: pointer;">
                <div>${addr.address}</div>
            </td>
            <td style="border: 1px solid #ccc; padding: 8px;">
                ${addr.house ? `<div>House District ${addr.house}</div>` : ''}
                ${addr.senate ? `<div>Senate District ${addr.senate}</div>` : ''}
            </td>
        </tr>
    `).join('');
    return tableWrapper(rows);
}

// Build table HTML grouped by house district
export function buildTable(houseDistrictsWithAddresses) {
    const rows = houseDistrictsWithAddresses.map((district, i) => {
        // Extract unique senate districts from the addresses in this house district
        const senateIds = [...new Set(district.addresses.map(a => a.senate))].filter(Boolean);
        const senateText = senateIds.map(id => `Senate District ${id}`).join(', ');
        const addressesHTML = district.addresses.map(addr => `<div>${addr.address}</div>`).join('');
        return `
            <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${i + 1}</td>            
                <td class="addresses-cell" style="border: 1px solid #ccc; padding: 8px; cursor: pointer;">
                    ${addressesHTML}<br>
                </td>       
                <td style="border: 1px solid #ccc; padding: 8px;">
                    <strong>House District ${district.id}</strong>
                    <strong>${senateText ? `<br><span>${senateText}</span>` : ''}</strong>
                </td>
            </tr>
        `;
    }).join('');
    return tableWrapper(rows);
}

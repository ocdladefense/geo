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

// Build table HTML ordered by district (one row per district, with all addresses in that district listed)
export function buildTable(districtsWithAddresses, districtType = 'house') {
    const rows = districtsWithAddresses.map((district, i) => {
        // Get the related district type (e.g. if this is a house district, the related type is senate)
        const relatedDistrictType = districtType === 'senate' ? 'house' : 'senate';
        // Get unique related district IDs from the addresses in this district
        const relatedDistrictIds = [
            ...new Set(district.addresses.map(address => address[relatedDistrictType]))
        ].filter(Boolean);
        // Build text like "House District 12, House District 15" for the related districts
        const relatedDistrictText = relatedDistrictIds
            .map(id => `${relatedDistrictType === 'house' ? 'House' : 'Senate'} District ${id}`)
            .join(', ');
        // Build HTML for the addresses in this district
        const addressesHTML = district.addresses.map(addr => `<div>${addr.address}</div>`).join('');
        return `
            <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${i + 1}</td>            
                <td class="addresses-cell" style="border: 1px solid #ccc; padding: 8px; cursor: pointer;">
                    ${addressesHTML}<br>
                </td>       
                <td style="border: 1px solid #ccc; padding: 8px;">
                    <strong>${districtType === 'senate' ? 'Senate' : 'House'} District ${district.id}</strong>
                    <strong>${relatedDistrictText ? `<br><span>${relatedDistrictText}</span>` : ''}</strong>
                </td>
            </tr>
        `;
    }).join('');
    return tableWrapper(rows);
}

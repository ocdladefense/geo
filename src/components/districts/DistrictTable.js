// Build table HTML for house districts
export function buildHouseTable(houseDistrictsWithAddresses) {
    const rows = houseDistrictsWithAddresses.map(district => {
        const addressesHTML = district.addresses.map(addr => `<li>${addr.address}</li>`).join('');
        // Each row will show the district and its associated addresses
        return `
            <tr style="border: 1px solid #ccc;">
                <td style="border: 1px solid #ccc; padding: 8px;">
                    <strong>House District ${district.id}</strong>
                </td>
                <td style="border: 1px solid #ccc; padding: 8px;">
                    <ul>${addressesHTML}</ul>
                </td>
            </tr>
        `;
    }).join('');
    // Wrap rows in a table structure
    return `
        <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">District</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Addresses</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
        </table>
    `;
}

// Build table HTML for senate districts
export function buildSenateTable(senateDistrictsWithAddresses) {
    const rows = senateDistrictsWithAddresses.map(district => {
        const addressesHTML = district.addresses.map(addr => `<li>${addr.address}</li>`).join('');
        // Each row will show the district and its associated addresses
        return `
            <tr style="border: 1px solid #ccc;">
                <td style="border: 1px solid #ccc; padding: 8px;">
                    <strong>Senate District ${district.id}</strong>
                </td>
                <td style="border: 1px solid #ccc; padding: 8px;">
                    <ul>${addressesHTML}</ul>
                </td>
            </tr>
        `;
    }).join('');
    // Wrap rows in a table structure
    return `
        <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">District</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Addresses</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
        </table>
    `;
}

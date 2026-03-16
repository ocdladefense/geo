


export default function Results({ results = [] }) {

    let styles = results.length > 0 ? { display: 'block', marginTop: '20px' } : { display: 'none' };

    return (
        <div id="results" style={styles}>
            <label htmlFor="order-by-district" style={{ fontSize: 'larger' }}>Order by district</label>
            <input type="checkbox" id="order-by-district" name="order-by-district" style={{ marginLeft: '10px' }} />

            <div id="result"></div>

        </div>
    );
}

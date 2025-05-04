import PublicGoogleSheetsParser from 'public-google-sheets-parser';
import { useState, useEffect } from 'react';

function Transactions({ user }) {


    const [items, setItems] = useState([])

    useEffect(() => {
        const parser = new PublicGoogleSheetsParser('1LHrW5rWxMevVtGhdjNU56j_tk_wCzszYP5w2Beg-q0s')
        parser.parse().then(data => {
            setItems(data);
        })
    }, [])


    return (
        <div >
            {/* Mostrar el json del usuario y excel para probar */}

            {items.map((item, index) => (
                <h5 color='black' key={index}>{JSON.stringify(item)}</h5>
            ))}
        </div>
    )
}

export default Transactions;
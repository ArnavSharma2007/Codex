import React from 'react';
import { Link } from 'react-router-dom';
export default function PaymentSuccessPage(){ 
    return (
    <div style={{textAlign:'center',marginTop:40}}>
        <h2>Payment Successful!</h2>
        <Link to='/home'>Back to Home</Link>
    </div>
    ) 
}

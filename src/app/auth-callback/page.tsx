import React from 'react'
import { useRouter, useSearchParams } from 'next/router';

const AuthCallback = () => {
    //INFO: the only purpose of this page is to maintain EVENTUAL CONSISTENCY.
    const router = useRouter();
    const searchParams = useSearchParams.get('origin');//dashboard.
    return (
    <div>AuthCallback</div>
  )
}

export default AuthCallback
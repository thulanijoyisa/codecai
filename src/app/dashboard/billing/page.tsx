import BillingForm from "@/components/BillingForm"
import { getUserSubscriptionPlan } from "@/lib/stripe"

const Page = async () => {
    const subscriptionPlan = await getUserSubscriptionPlan()
    
    if (!subscriptionPlan) {
        return <BillingForm subscriptionPlan={subscriptionPlan} /> 
    }
    if (subscriptionPlan.isCanceled) {
        return <div>Your subscription has been canceled</div>
    }
}

export default Page  
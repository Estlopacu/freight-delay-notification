import { config } from 'dotenv';
import type { DeliveryRoute } from '../types/delivery-route';
import { checkTrafficConditions } from '../activities/check-traffic-conditions';

config();

async function testCheckTraffic() {
  console.log('='.repeat(70));
  console.log('🚦 TRAFFIC CONDITIONS TEST');
  console.log('='.repeat(70));

  // Test route
  const route: DeliveryRoute = {
    origin: 'New York, NY',
    destination: 'Boston, MA',
    customerEmail: 'test@example.com',
    customerName: 'Test User',
  };

  console.log('\n📍 Route Configuration:');
  console.log(`   Origin: ${route.origin}`);
  console.log(`   Destination: ${route.destination}`);

  try {
    console.log('\n🔍 Fetching real-time traffic data from Google Maps API...');
    const trafficConditions = await checkTrafficConditions(route);

    console.log('\n' + '='.repeat(70));
    console.log('📊 TRAFFIC CONDITIONS RESULT');
    console.log('='.repeat(70));
    console.log(`Route: ${trafficConditions.routeSummary}`);
    console.log(`Distance: ${(trafficConditions.distance / 1000).toFixed(2)} km`);
    console.log(`Normal duration: ${Math.round(trafficConditions.durationWithoutTraffic / 60)} minutes`);
    console.log(`Current duration (with traffic): ${Math.round(trafficConditions.durationInTraffic / 60)} minutes`);
    console.log(`⏱️  Delay: ${trafficConditions.delayInMinutes} minutes`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ Traffic check completed successfully!');
    console.log('='.repeat(70));
  } catch (error) {
    console.error('\n❌ Failed to check traffic conditions:');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);

      if (error.message.includes('API key')) {
        console.error('\n💡 Hint: Check your GOOGLE_MAPS_API_KEY in .env file');
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        console.error('\n💡 Hint: You may have exceeded your Google Maps API quota');
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the test
testCheckTraffic();

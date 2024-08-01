import { memoryManager } from "../routes/memoryManager";
import { SCHEDULE_KEYS } from "../constants"; // Ensure you import SCHEDULE_KEYS

interface FilterCriteria {
  depart_schedule_id: number;
  return_schedule_id: number;
  depart_pricing_id: number;
  return_pricing_id: number;
}

// Function to filter the data based on the provided schedule IDs and pricing IDs
export async function filterData(phoneNo: string, filter: FilterCriteria): Promise<any | null> {
  const { depart_schedule_id, return_schedule_id, depart_pricing_id, return_pricing_id } = filter;

  // Retrieve the stored schedule info from the memory manager
  const scheduleInfo = await memoryManager.get(phoneNo, SCHEDULE_KEYS.SCHEDULE_INFO);
  if (!scheduleInfo) {
    console.error(`No schedule info found for phone number: ${phoneNo}`);
    return null;
  }

  const data = JSON.parse(scheduleInfo);

  // Step 1: Filter departures by schedule_id
  const filteredDeparture = data.departure.map((dep: any) => {
    const filteredSchedules = dep.schedule.map((sch: any) => {
      const filteredBodies = (sch.body || []).filter((body: any) => body.schedule_id === depart_schedule_id);
      sch.body = filteredBodies;
      return sch;
    }).filter((sch: any) => sch.body.length > 0); // Ensure schedule has valid body
    dep.schedule = filteredSchedules;
    return dep;
  }).filter((dep: any) => dep.schedule.length > 0); // Ensure departure has valid schedule

//   console.log(`Filtered departure schedules by schedule_id ${depart_schedule_id}:`, JSON.stringify(filteredDeparture, null, 2));

  // Step 2: Apply pricing filter within the filtered departures
//   console.log("Step 2: Apply pricing filter within the filtered departures");
  const finalFilteredDeparture = filteredDeparture.map((dep: any) => {
    const filteredSchedules = dep.schedule.map((sch: any) => {
      sch.body = sch.body.map((body: any) => {
        const filteredPricing = body.pricing.filter((price: any) => {
          const match = Number(price.pricing_id) === Number(depart_pricing_id);
//           console.log(`Checking pricing_id for departure: ${Number(price.pricing_id)} === ${Number(depart_pricing_id)}: ${match}`);
          return match;
        });
        body.pricing = filteredPricing;
        return body;
      }).filter((body: any) => body.pricing.length > 0); // Ensure body has valid pricing
      return sch;
    }).filter((sch: any) => sch.body.length > 0); // Ensure schedule has valid body
    return dep;
  }).filter((dep: any) => dep.schedule.length > 0); // Ensure departure has valid schedule

//   console.log(`Final filtered departure schedules:`, JSON.stringify(finalFilteredDeparture, null, 2));

  // Step 1: Filter returns by schedule_id
  const filteredReturn = data.return.map((ret: any) => {
    const filteredSchedules = ret.schedule.map((sch: any) => {
      const filteredBodies = (sch.body || []).filter((body: any) => body.schedule_id === return_schedule_id);
      sch.body = filteredBodies;
      return sch;
    }).filter((sch: any) => sch.body.length > 0); // Ensure schedule has valid body
    ret.schedule = filteredSchedules;
    return ret;
  }).filter((ret: any) => ret.schedule.length > 0); // Ensure return has valid schedule

//   console.log(`Filtered return schedules by schedule_id ${return_schedule_id}:`, JSON.stringify(filteredReturn, null, 2));

  // Step 2: Apply pricing filter within the filtered returns
//   console.log("Step 2: Apply pricing filter within the filtered returns");
  const finalFilteredReturn = filteredReturn.map((ret: any) => {
    const filteredSchedules = ret.schedule.map((sch: any) => {
      sch.body = sch.body.map((body: any) => {
        const filteredPricing = body.pricing.filter((price: any) => {
          const match = Number(price.pricing_id) === Number(return_pricing_id);
//           console.log(`Checking pricing_id for return: ${Number(price.pricing_id)} === ${Number(return_pricing_id)}: ${match}`);
          return match;
        });
        body.pricing = filteredPricing;
        return body;
      }).filter((body: any) => body.pricing.length > 0); // Ensure body has valid pricing
      return sch;
    }).filter((sch: any) => sch.body.length > 0); // Ensure schedule has valid body
    return ret;
  }).filter((ret: any) => ret.schedule.length > 0); // Ensure return has valid schedule

//   console.log(`Final filtered return schedules:`, JSON.stringify(finalFilteredReturn, null, 2));

  const result = {
    ...data,
    departure: finalFilteredDeparture,
    return: finalFilteredReturn
  };

//   console.log("Filtered Data:", JSON.stringify(result, null, 2));

  return result;
}

import { shopApiRequest } from '@/lib/graphql/client';

const RETURN_FIELDS = `
  id createdAt updatedAt orderId orderCode customerName customerEmail
  items { orderLineId quantity reason }
  reason note image status adminNote
`;

const REQUEST_RETURN = `
  mutation RequestOrderReturn($input: RequestCustomerReturnInput!) {
    requestOrderReturn(input: $input) {
      success errorCode message returnRequest { ${RETURN_FIELDS} }
    }
  }
`;

const MY_RETURNS = `
  query MyReturnRequests($skip: Int!, $take: Int!) {
    myReturnRequests(skip: $skip, take: $take) { totalItems items { ${RETURN_FIELDS} } }
  }
`;

const CANCEL_RETURN = `
  mutation CancelMyReturn($id: ID!) {
    cancelMyReturnRequest(id: $id) { success errorCode message returnRequest { ${RETURN_FIELDS} } }
  }
`;

function mapReturn(item) {
  if (!item) return null;
  return {
    id: String(item.id), order_id: String(item.orderId), order_code: item.orderCode,
    items: item.items || [], reason: item.reason, note: item.note, image: item.image,
    status: String(item.status || 'REQUESTED').toLowerCase(), admin_note: item.adminNote,
    created_at: item.createdAt, updated_at: item.updatedAt,
  };
}

export async function createUserReturnApi(payload) {
  const data = await shopApiRequest(REQUEST_RETURN, {
    input: {
      orderId: payload.order_id,
      items: (payload.items || []).map((item) => ({
        orderLineId: item.item_id,
        quantity: Number(item.quantity),
        reason: item.reason || payload.reason,
      })),
      reason: payload.reason,
      note: payload.note || null,
      image: payload.image_base64 || null,
    },
  });
  const response = data.requestOrderReturn;
  return {
    success: Boolean(response?.success), message: response?.message, errorCode: response?.errorCode,
    data: { return: mapReturn(response?.returnRequest) },
  };
}

export async function fetchUserReturnsApi({ limit = 20, offset = 0 } = {}) {
  const data = await shopApiRequest(MY_RETURNS, { skip: offset, take: limit });
  return { success: true, data: { returns: (data.myReturnRequests?.items || []).map(mapReturn), pagination: { total: data.myReturnRequests?.totalItems || 0 } } };
}

export async function cancelUserReturnApi(id) {
  const data = await shopApiRequest(CANCEL_RETURN, { id });
  const response = data.cancelMyReturnRequest;
  return { success: Boolean(response?.success), message: response?.message, data: { return: mapReturn(response?.returnRequest) } };
}

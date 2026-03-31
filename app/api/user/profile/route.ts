import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkUserPermissions } from '@/lib/permissions';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  let user = db.getUser(session.sub);
  
  // Create user if first login
  if (!user) {
    user = db.createUser({
      id: session.sub,
      email: session.email,
      name: session.name,
      picture: session.picture,
      userType: 'free',
      remainingCredits: 0,
      unlimitedStandardSwitch: false,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    });
  } else {
    db.updateUser(session.sub, { lastLoginAt: Date.now() });
  }

  const permissions = checkUserPermissions(user);

  return NextResponse.json({
    user: {
      email: user.email,
      name: user.name,
      picture: user.picture,
      userType: user.userType,
      subscriptionEndDate: user.subscriptionEndDate,
      remainingCredits: permissions.remainingCredits,
      canSwitchStandards: permissions.canSwitchStandards,
    },
  });
}

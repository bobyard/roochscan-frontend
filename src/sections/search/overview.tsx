'use client';

import { useEffect, useState } from 'react';
import { isValidBitcoinAddress } from '@roochnetwork/rooch-sdk';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';

import { Card, Stack, Button, TextField, CardHeader, CardContent } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import useTimeRange from 'src/hooks/useTimeRange';

import { DashboardContent } from 'src/layouts/dashboard';

import TransactionsTableHome from '../transactions/components/transactions-table-home';

// const placeholder = 'tb1pjugffa0n2ts0vra032t3phae7xrehdjfzkg284ymvf260vjh225s5u4z76';
const placeholder = 'Search for transactions, accounts, and modules';

export default function SearchView() {
  const [account, setAccount] = useState('');
  const [errorMsg, setErrorMsg] = useState<string>();
  const router = useRouter();

  const { fiveMinutesAgoMillis, currentTimeMillis } = useTimeRange(5000); 

  const handleSearch = () => {
    if (!account.startsWith('0x') && isValidBitcoinAddress(account)) {
      router.push(`/account/${account || placeholder}`);
    } else if (account.startsWith('0x')) {
      router.push(`/tx/${account}`);
    }
  };


  const { data: transactionsList, isPending: isTransactionsPending, refetch } = useRoochClientQuery(
    'queryTransactions',
    {
      filter: {
        time_range: {
          start_time: fiveMinutesAgoMillis.toString(), // 5 分钟前的时间
          end_time: currentTimeMillis.toString(), // 固定的当前时间
        },
      },
      limit: '10',
    },
    { enabled: !!currentTimeMillis }
  );

  useEffect(() => {
    // 定义请求的 interval
    const intervalId = setInterval(() => {
      refetch();
    }, 1000 * 5);

    // 清理 interval
    return () => clearInterval(intervalId);
  }, [refetch]); // 依赖 refetch，以确保在 refetch 改变时重新设置 interval

  return (
    <DashboardContent maxWidth="xl">
      <Card>
        <CardHeader
          title="Search "
          subheader="Search for transactions, accounts, and modules."
          sx={{ mb: 2 }}
        />
        <CardContent className="!pt-0">
          <Stack direction="row" alignItems="flex-start" className="w-full" spacing={2}>
            <TextField
              size="small"
              className="w-full"
              value={account}
              placeholder={placeholder}
              error={Boolean(errorMsg)}
              helperText={errorMsg}
              onChange={(e) => {
                setAccount(e.target.value);
              }}
            />
            <Button onClick={handleSearch}>Search</Button>
          </Stack>
        </CardContent>
      </Card>
      <TransactionsTableHome
        dense
        isPending={isTransactionsPending}
        transactionsList={transactionsList}
      />
    </DashboardContent>
  );
}

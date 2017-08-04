'standard' extension interfaces represent services which multiple different impls' may exist for.
  there is currently no way for organic growth;
    there is no way to register an extension. see https://github.com/ags131/PosisKernel/blob/agsos/src/lib/ExtensionRegistry.ts for an impl'ed example of what might faciliate this

  pCtx.queryPosisInterface(IPosisLoggerFactory).get("myLogger").debug("hello");

ipc
  processes have no generic way to communicate with each other;
  in order to talk to another process, in an capacity, I need to bind to their interfaces.
  having generic standards such as #notify(), #send(message), #recieve(message)
  would faciliate a semi standard API to program to.

  pCtx.queryPosisInterface("baseKernel").getProcessById(pCtx.parentId).send({ val:"my results" });
